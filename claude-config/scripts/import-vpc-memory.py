#!/usr/bin/env python3
"""
Import VPC memory files into claude-mem database.
Parses markdown session summaries and creates observations.

Usage:
    python3 import-vpc-memory.py [--dry-run]
"""

import json
import re
import sqlite3
import subprocess
from datetime import datetime
from pathlib import Path
import argparse
import uuid

DB_PATH = Path.home() / ".claude-mem" / "claude-mem.db"

def fetch_vpc_memory():
    """Fetch all memory files from VPC."""
    result = subprocess.run(
        ["ssh", "-o", "ConnectTimeout=5", "vpc-clawdbot", "cat ~/memory/*.md"],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"Failed to fetch VPC memory: {result.stderr}")
        return ""
    return result.stdout

def parse_memory_content(content: str) -> list:
    """Parse markdown memory into observations."""
    observations = []
    seen_titles = set()  # Dedupe by title+date

    # Split into sessions
    sessions = re.split(r'^## Session', content, flags=re.MULTILINE)

    for session_text in sessions:
        if not session_text.strip():
            continue

        # Extract session metadata
        lines = session_text.strip().split('\n')
        if not lines:
            continue

        # First line has time and title
        header_match = re.match(r'(\d{2}:\d{2})\s*[—-]\s*(.+)', lines[0])
        if not header_match:
            continue

        time_str = header_match.group(1)
        raw_title = header_match.group(2)

        # Clean title - remove HTML tags and extract meaningful text
        title = re.sub(r'<[^>]+>', '', raw_title)  # Remove HTML tags
        title = re.sub(r'#\s*', '', title)  # Remove markdown headers
        title = title.strip()[:100]

        # Skip if title looks like garbage
        if not title or len(title) < 5 or title.startswith('Caveat'):
            continue

        # Find session ID
        session_id = None
        for line in lines:
            id_match = re.search(r'Session ID:\*?\*?\s*([a-f0-9-]+)', line)
            if id_match:
                session_id = id_match.group(1)
                break

        # Find date from nearby content or use today
        date_match = re.search(r'(\d{4}-\d{2}-\d{2})', session_text)
        date_str = date_match.group(1) if date_match else datetime.now().strftime('%Y-%m-%d')

        # Extract actions/content
        actions = []
        in_actions = False
        for line in lines:
            if '### Actions' in line or '### Decisions' in line:
                in_actions = True
                continue
            if line.startswith('##'):
                in_actions = False
            if in_actions and line.strip().startswith('-'):
                action = line.strip().lstrip('- ').strip()
                if action and len(action) > 10:
                    actions.append(action)

        # Skip empty sessions
        if not actions:
            continue

        # Dedupe by title+date
        dedupe_key = f"{date_str}:{title[:30]}"
        if dedupe_key in seen_titles:
            continue
        seen_titles.add(dedupe_key)

        # Create observation
        obs = {
            'session_id': session_id or f"vpc-{uuid.uuid4().hex[:8]}",
            'project': 'vpc-memory',
            'type': 'discovery',
            'title': title[:60],
            'subtitle': f"Session at {time_str}",
            'narrative': '\n'.join(actions[:5])[:500],
            'concepts': json.dumps(extract_concepts(title + ' ' + ' '.join(actions))),
            'files_read': '[]',
            'files_modified': '[]',
            'created_at': f"{date_str}T{time_str}:00Z",
            'source': 'vpc-import'
        }
        observations.append(obs)

    return observations

def extract_concepts(text: str) -> list:
    """Extract keywords/concepts from text."""
    # Common keywords to look for
    keywords = [
        'claude', 'api', 'memory', 'agent', 'workflow', 'skill', 'hook',
        'config', 'install', 'deploy', 'test', 'debug', 'fix', 'build',
        'content', 'figma', 'html', 'css', 'norton', 'design', 'ipm',
        'session', 'roundtable', 'prometheus', 'sisyphus', 'oracle',
        'vpc', 'sync', 'git', 'commit', 'push', 'branch'
    ]

    text_lower = text.lower()
    found = [k for k in keywords if k in text_lower]
    return found[:5]

def import_to_database(observations: list, dry_run: bool = False) -> int:
    """Insert observations into claude-mem database."""
    if dry_run:
        return len(observations)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    imported = 0
    for obs in observations:
        try:
            # Check if already exists (by title and date)
            cursor.execute(
                "SELECT id FROM observations WHERE title = ? AND date(created_at) = date(?)",
                (obs['title'], obs['created_at'])
            )
            if cursor.fetchone():
                continue

            # Parse timestamp for epoch
            try:
                dt = datetime.fromisoformat(obs['created_at'].replace('Z', '+00:00'))
                epoch = int(dt.timestamp() * 1000)
            except:
                epoch = int(datetime.now().timestamp() * 1000)

            # Create session first (sdk_sessions table)
            memory_session_id = f"backfill-{obs['session_id'][:8]}"
            cursor.execute("""
                INSERT OR IGNORE INTO sdk_sessions (
                    content_session_id, memory_session_id, project,
                    started_at, started_at_epoch, status
                ) VALUES (?, ?, ?, ?, ?, 'completed')
            """, (
                f"vpc-{obs['session_id'][:8]}",
                memory_session_id,
                obs['project'],
                obs['created_at'],
                epoch
            ))

            # Insert observation
            cursor.execute("""
                INSERT INTO observations (
                    memory_session_id, project, type, title, subtitle,
                    narrative, concepts, files_read, files_modified,
                    created_at, created_at_epoch
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                memory_session_id, obs['project'], obs['type'], obs['title'],
                obs['subtitle'], obs['narrative'], obs['concepts'],
                obs['files_read'], obs['files_modified'],
                obs['created_at'], epoch
            ))
            imported += 1

        except sqlite3.Error as e:
            print(f"  Error inserting: {e}")

    conn.commit()
    conn.close()
    return imported

def main():
    parser = argparse.ArgumentParser(description='Import VPC memory to claude-mem')
    parser.add_argument('--dry-run', action='store_true', help='Parse but do not import')
    args = parser.parse_args()

    print("Fetching VPC memory...")
    content = fetch_vpc_memory()

    if not content:
        print("No content fetched from VPC")
        return

    print(f"Fetched {len(content)} bytes")

    print("\nParsing memory files...")
    observations = parse_memory_content(content)
    print(f"Found {len(observations)} observations")

    if not observations:
        print("No observations to import")
        return

    # Show sample
    print("\nSample observations:")
    for obs in observations[:3]:
        print(f"  - [{obs['created_at'][:10]}] {obs['title']}")

    if args.dry_run:
        print(f"\nDRY RUN: Would import {len(observations)} observations")
        return

    print(f"\nImporting to {DB_PATH}...")
    imported = import_to_database(observations, args.dry_run)
    print(f"Imported {imported} new observations")

if __name__ == "__main__":
    main()
