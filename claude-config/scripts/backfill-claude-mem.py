#!/usr/bin/env python3
"""
Backfill historical Claude Code sessions into claude-mem.
Processes .jsonl transcripts and generates observations via LLM.

Usage:
    python3 backfill-claude-mem.py [--dry-run] [--limit N] [--project PROJECT]
"""

import json
import os
import sys
import argparse
import hashlib
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

try:
    import anthropic
except ImportError:
    print("Installing anthropic...")
    os.system("pip3 install anthropic")
    import anthropic

CLAUDE_MEM_API = "http://127.0.0.1:37777"
PROJECTS_DIR = Path.home() / ".claude" / "projects"

# Observation extraction prompt
EXTRACTION_PROMPT = """You are extracting observations from a Claude Code session transcript.

Extract 1-5 significant observations. Each observation captures something WORTH REMEMBERING:
- Discoveries: How something works, why it exists, gotchas found
- Decisions: Choices made and rationale
- Changes: What was modified and why
- Patterns: Reusable approaches discovered

For each observation, output valid JSON:
{
  "type": "discovery|decision|change|pattern",
  "title": "Short title (max 60 chars)",
  "subtitle": "One-line summary",
  "narrative": "2-3 sentence explanation of what happened and why it matters",
  "concepts": ["keyword1", "keyword2", "keyword3"],
  "files_read": ["file1.ts", "file2.py"],
  "files_modified": ["file3.ts"]
}

Rules:
- ONLY extract genuinely useful observations (not every tool call)
- Skip trivial actions like "read file" or "list directory"
- Focus on LEARNINGS, DECISIONS, and SIGNIFICANT CHANGES
- If nothing significant, return empty array []

Output valid JSON array ONLY. No markdown, no explanation.

Transcript:
"""

def get_project_name(path: Path) -> str:
    """Extract project name from path."""
    # Path like: -Users-yuanlun-xu-content-dev-skills
    name = path.name
    if name.startswith("-Users-"):
        # Extract last part after username
        parts = name.split("-")
        if len(parts) > 3:
            return "-".join(parts[3:])
    return name

# Patterns to skip (trash, errors, fillers)
SKIP_PATTERNS = [
    'API Error',
    'authentication_error',
    'OAuth token has expired',
    'Please run /login',
    'hook error',
    'Error:',
    'placeholder',
    '[Omitted',
    'system-reminder',
    'task tools haven\'t been used',
    'gentle reminder',
    'You are a learning extraction system',  # Meta-extraction prompts
    'Output valid JSON array ONLY',
    'No markdown, no explanation',
]

def is_trash_content(text: str) -> bool:
    """Check if content is filler/error/placeholder."""
    if not text:
        return True
    text_lower = text.lower()
    for pattern in SKIP_PATTERNS:
        if pattern.lower() in text_lower:
            return True
    # Skip very short or very long single lines (likely errors or dumps)
    if len(text) < 20 or (len(text) > 5000 and '\n' not in text[:1000]):
        return True
    return False

def parse_transcript(filepath: Path) -> dict:
    """Parse a JSONL transcript into structured conversation."""
    messages = []
    session_id = filepath.stem
    project = get_project_name(filepath.parent)
    first_timestamp = None
    last_timestamp = None
    error_count = 0
    total_count = 0

    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            try:
                entry = json.loads(line)
                entry_type = entry.get('type')
                timestamp = entry.get('timestamp')

                if timestamp:
                    if not first_timestamp:
                        first_timestamp = timestamp
                    last_timestamp = timestamp

                # Track errors
                if entry.get('error') or entry.get('isApiErrorMessage'):
                    error_count += 1
                    continue

                if entry_type == 'user':
                    msg = entry.get('message', {})
                    content = msg.get('content', '')
                    if isinstance(content, str) and content.strip():
                        if not is_trash_content(content):
                            messages.append({
                                'role': 'user',
                                'content': content[:2000],
                                'timestamp': timestamp
                            })
                            total_count += 1

                elif entry_type == 'assistant':
                    msg = entry.get('message', {})
                    content_list = msg.get('content', [])
                    text_parts = []
                    tool_uses = []

                    for item in content_list:
                        if isinstance(item, dict):
                            if item.get('type') == 'text':
                                text = item.get('text', '')
                                if not is_trash_content(text):
                                    text_parts.append(text[:1000])
                            elif item.get('type') == 'tool_use':
                                tool_uses.append({
                                    'name': item.get('name', 'unknown'),
                                    'input': str(item.get('input', ''))[:500]
                                })

                    if text_parts or tool_uses:
                        messages.append({
                            'role': 'assistant',
                            'content': '\n'.join(text_parts),
                            'tool_uses': tool_uses,
                            'timestamp': timestamp
                        })
                        total_count += 1

            except json.JSONDecodeError:
                continue

    # Skip sessions that are mostly errors
    error_ratio = error_count / max(total_count + error_count, 1)

    return {
        'session_id': session_id,
        'project': project,
        'messages': messages,
        'first_timestamp': first_timestamp,
        'last_timestamp': last_timestamp,
        'filepath': str(filepath),
        'error_ratio': error_ratio,
        'is_trash': error_ratio > 0.5 or total_count < 3
    }

def format_for_extraction(transcript: dict) -> str:
    """Format transcript for LLM extraction."""
    lines = []
    lines.append(f"Project: {transcript['project']}")
    lines.append(f"Session: {transcript['session_id'][:8]}")
    lines.append(f"Date: {transcript['first_timestamp'][:10] if transcript['first_timestamp'] else 'unknown'}")
    lines.append("---")

    for msg in transcript['messages'][-30:]:  # Last 30 messages
        role = msg['role'].upper()
        content = msg['content'][:800] if msg['content'] else ''

        if msg['role'] == 'assistant' and msg.get('tool_uses'):
            tools = ', '.join([t['name'] for t in msg['tool_uses'][:5]])
            lines.append(f"{role}: {content}\n[Tools: {tools}]")
        else:
            lines.append(f"{role}: {content}")
        lines.append("")

    return '\n'.join(lines)

def extract_observations(client: anthropic.Anthropic, transcript: dict) -> list:
    """Use Claude to extract observations from transcript."""
    formatted = format_for_extraction(transcript)

    if len(formatted) < 200:  # Skip very short transcripts
        return []

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": EXTRACTION_PROMPT + formatted
            }]
        )

        response_text = response.content[0].text.strip()

        # Clean up response
        if response_text.startswith('```'):
            response_text = response_text.split('\n', 1)[1]
        if response_text.endswith('```'):
            response_text = response_text.rsplit('```', 1)[0]

        observations = json.loads(response_text)

        # Add metadata to each observation
        for obs in observations:
            obs['session_id'] = transcript['session_id']
            obs['project'] = transcript['project']
            obs['created_at'] = transcript['first_timestamp'] or datetime.utcnow().isoformat()
            obs['source'] = 'backfill'

        return observations

    except Exception as e:
        print(f"  Error extracting: {e}")
        return []

def save_observations(observations: list, dry_run: bool = False) -> int:
    """Save observations to claude-mem via API."""
    if dry_run or not observations:
        return len(observations)

    saved = 0
    import urllib.request

    for obs in observations:
        try:
            # Create session if needed
            session_data = json.dumps({
                "sessionId": f"backfill-{obs['session_id'][:8]}",
                "project": obs['project'],
                "cwd": f"/backfill/{obs['project']}"
            }).encode()

            req = urllib.request.Request(
                f"{CLAUDE_MEM_API}/api/sessions",
                data=session_data,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            try:
                urllib.request.urlopen(req, timeout=5)
            except:
                pass  # Session might already exist

            # Create observation
            obs_data = json.dumps({
                "sessionId": f"backfill-{obs['session_id'][:8]}",
                "type": obs.get('type', 'discovery'),
                "title": obs.get('title', 'Untitled')[:100],
                "subtitle": obs.get('subtitle', '')[:200],
                "narrative": obs.get('narrative', '')[:2000],
                "concepts": json.dumps(obs.get('concepts', [])),
                "files_read": json.dumps(obs.get('files_read', [])),
                "files_modified": json.dumps(obs.get('files_modified', [])),
                "created_at": obs.get('created_at')
            }).encode()

            req = urllib.request.Request(
                f"{CLAUDE_MEM_API}/api/sessions/observations",
                data=obs_data,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            urllib.request.urlopen(req, timeout=5)
            saved += 1

        except Exception as e:
            print(f"  Error saving: {e}")

    return saved

def get_processed_sessions() -> set:
    """Get list of already processed session IDs."""
    processed_file = Path.home() / ".claude-mem" / "backfill-processed.txt"
    if processed_file.exists():
        return set(processed_file.read_text().strip().split('\n'))
    return set()

def mark_processed(session_id: str):
    """Mark a session as processed."""
    processed_file = Path.home() / ".claude-mem" / "backfill-processed.txt"
    with open(processed_file, 'a') as f:
        f.write(f"{session_id}\n")

def process_transcript(args) -> dict:
    """Process a single transcript file."""
    filepath, client, dry_run = args

    try:
        transcript = parse_transcript(filepath)

        if transcript.get('is_trash'):
            return {'status': 'skipped', 'reason': 'trash_session', 'file': str(filepath)}

        if len(transcript['messages']) < 3:
            return {'status': 'skipped', 'reason': 'too_short', 'file': str(filepath)}

        observations = extract_observations(client, transcript)

        if observations:
            saved = save_observations(observations, dry_run)
            mark_processed(transcript['session_id'])
            return {
                'status': 'success',
                'file': str(filepath),
                'observations': len(observations),
                'saved': saved
            }
        else:
            mark_processed(transcript['session_id'])
            return {'status': 'empty', 'file': str(filepath)}

    except Exception as e:
        return {'status': 'error', 'file': str(filepath), 'error': str(e)}

def main():
    parser = argparse.ArgumentParser(description='Backfill claude-mem from historical transcripts')
    parser.add_argument('--dry-run', action='store_true', help='Extract but do not save')
    parser.add_argument('--limit', type=int, default=0, help='Limit number of files to process')
    parser.add_argument('--project', type=str, help='Only process specific project')
    parser.add_argument('--workers', type=int, default=3, help='Number of parallel workers')
    args = parser.parse_args()

    # Find all transcript files
    files = []
    for project_dir in PROJECTS_DIR.iterdir():
        if not project_dir.is_dir():
            continue
        if args.project and args.project not in project_dir.name:
            continue

        for jsonl in project_dir.glob("*.jsonl"):
            files.append(jsonl)
        # Also check subagent directories
        for subdir in project_dir.glob("*/subagents"):
            for jsonl in subdir.glob("*.jsonl"):
                files.append(jsonl)

    # Filter out already processed
    processed = get_processed_sessions()
    files = [f for f in files if f.stem not in processed]

    if args.limit:
        files = files[:args.limit]

    print(f"Found {len(files)} unprocessed transcripts")

    if not files:
        print("Nothing to process.")
        return

    # Initialize Anthropic client
    client = anthropic.Anthropic()

    # Process files
    total = len(files)
    success = 0
    observations_total = 0

    print(f"\nProcessing with {args.workers} workers...")

    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {
            executor.submit(process_transcript, (f, client, args.dry_run)): f
            for f in files
        }

        for i, future in enumerate(as_completed(futures), 1):
            result = future.result()
            status = result['status']

            if status == 'success':
                success += 1
                observations_total += result.get('observations', 0)
                print(f"[{i}/{total}] ✓ {Path(result['file']).stem[:12]}... ({result['observations']} obs)")
            elif status == 'empty':
                print(f"[{i}/{total}] - {Path(result['file']).stem[:12]}... (no observations)")
            elif status == 'skipped':
                print(f"[{i}/{total}] · {Path(result['file']).stem[:12]}... (skipped)")
            else:
                print(f"[{i}/{total}] ✗ {Path(result['file']).stem[:12]}... ({result.get('error', 'unknown')})")

            # Rate limiting
            time.sleep(0.3)

    print(f"\n{'DRY RUN ' if args.dry_run else ''}Complete!")
    print(f"Processed: {total}")
    print(f"Successful: {success}")
    print(f"Total observations: {observations_total}")

if __name__ == "__main__":
    main()
