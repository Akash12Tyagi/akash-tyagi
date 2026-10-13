@echo off
rem Double-click to open the Lusso di Firenze homepage in your browser.
cd /d "%~dp0"
set PORT=8765
start "" "http://localhost:%PORT%/index.html"
echo Serving on http://localhost:%PORT%  (close this window to stop)
where py >nul 2>nul && (py -m http.server %PORT%) || (python -m http.server %PORT%) || (npx --yes serve -l %PORT% .)
pause
