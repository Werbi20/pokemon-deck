@echo off
echo ========================================
echo   Pokemon TCG Deck Manager
echo   Executando: npm run dev
echo ========================================
echo.

REM Adicionar Node.js ao PATH da sessao atual
set PATH=%PATH%;C:\Program Files\nodejs\

echo PATH atualizado com Node.js
echo.

REM Verificar se funciona
echo Testando Node.js:
node --version
echo.

echo Testando npm:
npm --version
echo.

echo Executando: npm run dev
echo Acesse: http://localhost:3000
echo Para parar: Ctrl+C
echo.

REM Executar o comando
npm run dev

echo.
echo Servidor parado.
pause

