@echo off
title ArkaShine Innovations - SoilENZ Inventory Portal Server
echo ===================================================================
echo  Starting ArkaShine Innovations SoilENZ Dashboard & SQLite Server...
echo ===================================================================
echo.
cd /d "%~dp0"
node server.js
pause
