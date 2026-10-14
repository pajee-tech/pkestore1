@echo off
REM PKeStore ko GitHub pe push karta hai (100-file web limit ke baghair).
REM Pehle Git install karein: https://git-scm.com/download/win
REM Phir GitHub pe khali PRIVATE repository banayein (README add na karein).
cd /d "%~dp0"
where git >nul 2>nul || (echo Git install nahi hai. https://git-scm.com/download/win se install karein. & pause & exit /b 1)
set /p REPO=GitHub repository URL paste karein (misal https://github.com/naam/pkestore.git): 
if not exist ".git" git init
git add -A
git -c user.name="PKeStore" -c user.email="pkestore@gmail.com" commit -m "PKeStore website" >nul 2>nul
git branch -M main
git remote remove origin >nul 2>nul
git remote add origin %REPO%
git push -u origin main
echo.
echo Agar upar koi error nahi, to code GitHub pe chala gaya. Browser mein repository refresh karein.
pause
