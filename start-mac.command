#!/bin/bash
# Double-click to open the Lusso di Firenze homepage in your browser.
cd "$(dirname "$0")"
PORT=8765
(sleep 1; open "http://localhost:$PORT/index.html") &
echo "Serving on http://localhost:$PORT  (close this window to stop)"
python3 -m http.server $PORT
