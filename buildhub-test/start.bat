@echo off
REM BuildHub — ლოკალური გაშვება Windows-ზე.
REM გაშვება: აამუშავეთ ეს ფაილი ორმაგი დაწკაპუნებით ან ტერმინალში: start.bat

where node >nul 2>nul
if errorlevel 1 (
  echo [X] Node.js ver movizebna. Daayenet Node 22 an ufro axali: https://nodejs.org
  pause
  exit /b 1
)

if not exist package.json (
  echo [X] Gaushvit es skripti proeqtis fesvidan ^(sadac package.json aris^)
  pause
  exit /b 1
)

node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)"
if errorlevel 1 (
  echo [X] Sachiroa Node.js 22 an ufro axali versia.
  pause
  exit /b 1
)

if not exist node_modules (
  echo [>] Damokidebulebebis dayeneba ^(npm ci^)...
  call npm ci
  if errorlevel 1 exit /b 1
)

if not exist .env.local (
  copy .env.example .env.local >nul
  echo.
  echo [!] Sheikmna .env.local — sheavset Supabase-is gasagebi da gaushvit xelaxla.
  echo.
  pause
  exit /b 0
)

echo.
echo [>] Serveri irtveba: http://localhost:3000
echo [>] Testeri:          http://localhost:3000/test.html
echo.

call npm run dev
pause
