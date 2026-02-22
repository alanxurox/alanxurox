#!/usr/bin/env python3
"""Import local learnings files into claude-mem."""

import json
import re
import sqlite3
from datetime import datetime
from pathlib import Path
import uuid

DB_PATH = Path.home() / ".claude-mem" / "claude-mem.db"
LEARNINGS_DIR = Path.home() / ".claude" / "memory" / "learnings"

def import_learnings():
    if not LEARNINGS_DIR.exists():
        print("No learnings directory found")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    imported = 0
    for md_file in LEARNINGS_DIR.glob("*.md"):
        if md_file.stat().st_size == 0:
            continue

        content = md_file.read_text()
        filename = md_file.stem

        # Extract date from filename
        date_match = re.match(r'(\d{4}-\d{2}-\d{2})', filename)
        date_str = date_match.group(1) if date_match else "2026-01-27"

        # Extract title from first heading
        title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        title = title_match.group(1)[:60] if title_match else filename[:60]

        # Extract first few paragraphs as narrative
        paragraphs = re.findall(r'^(?!#)(.{30,})$', content, re.MULTILINE)
        narrative = '\n'.join(paragraphs[:3])[:500]

        # Extract keywords from headings
        headings = re.findall(r'^##\s+(.+)$', content, re.MULTILINE)
        concepts = [h.lower().replace(' ', '-')[:20] for h in headings[:5]]

        try:
            # Check if exists
            cursor.execute(
                "SELECT id FROM observations WHERE title = ?", (title,)
            )
            if cursor.fetchone():
                print(f"  Skip (exists): {title[:40]}")
                continue

            epoch = int(datetime.fromisoformat(f"{date_str}T12:00:00").timestamp() * 1000)
            session_id = f"learnings-{date_str}"

            # Create session
            cursor.execute("""
                INSERT OR IGNORE INTO sdk_sessions (
                    content_session_id, memory_session_id, project,
                    started_at, started_at_epoch, status
                ) VALUES (?, ?, 'learnings', ?, ?, 'completed')
            """, (session_id, session_id, f"{date_str}T12:00:00Z", epoch))

            # Create observation
            cursor.execute("""
                INSERT INTO observations (
                    memory_session_id, project, type, title, subtitle,
                    narrative, concepts, files_read, files_modified,
                    created_at, created_at_epoch
                ) VALUES (?, 'learnings', 'decision', ?, ?, ?, ?, '[]', '[]', ?, ?)
            """, (
                session_id, title, filename,
                narrative, json.dumps(concepts),
                f"{date_str}T12:00:00Z", epoch
            ))
            imported += 1
            print(f"  Imported: {title[:40]}")

        except sqlite3.Error as e:
            print(f"  Error: {e}")

    conn.commit()
    conn.close()
    print(f"\nImported {imported} learnings files")

if __name__ == "__main__":
    import_learnings()
