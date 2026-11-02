@echo off
title ArkaShine Innovations - SoilENZ, Soil Sparsh & Soil Life Portal
echo ===================================================================
echo  Starting ArkaShine Innovations Multi-Product Inventory Portal...
echo  Supports: SoilENZ, Soil Sparsh, Soil Life, Others, Common Parts
echo ===================================================================
echo.
cd /d "%~dp0"
node --experimental-sqlite server.js
pause
