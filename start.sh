#!/bin/sh
# Linux: serve the homepage and open it.
cd "$(dirname "$0")"
PORT=8765
(sleep 1; xdg-open "http://localhost:$PORT/index.html" >/dev/null 2>&1) &
python3 -m http.server $PORT
