#!/bin/sh
# Chiusura di un modulo: commit e push su main, archivio per la copia di sicurezza (.backup.b64). Uso: sh tools/fine_modulo.sh "messaggio"
set -e
cd "$(dirname "$0")/.."
git add -A
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -qm "$1

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RpDztwWkT2wtkaPHWkFeuk"
git push -q origin main
tar czf - --exclude=node_modules --exclude=.git --exclude=dist --exclude=dist-single --exclude=dist-artifact --exclude=__pycache__ --exclude=.backup.b64 . | base64 > .backup.b64
git log --oneline | head -1
