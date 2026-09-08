@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if errorlevel 1 goto try_python
py -3 -c "import sys" >nul 2>nul
if errorlevel 1 goto try_python
py -3 server.py
goto finish
:try_python
python -c "import sys; assert sys.version_info.major == 3" >nul 2>nul
if errorlevel 1 goto offline
python server.py
goto finish
:offline
echo Python 3 not found. Opening offline calculator. Quote API requires Python 3.
start "" "%~dp0dist\index.html"
:finish
if errorlevel 1 pause
endlocal
