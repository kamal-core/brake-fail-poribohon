@echo off
title বাপের রাস্তা - Baper Rasta
echo ==============================================
echo   বাপের রাস্তা (Baper Rasta) 3D Driving Game
echo   লোকাল সার্ভার চালু হচ্ছে...
echo ==============================================

set "PATH=C:\Program Files\nodejs;%PATH%"

cd /d "%~dp0"

start http://localhost:5173/
call npm.cmd run dev
pause
