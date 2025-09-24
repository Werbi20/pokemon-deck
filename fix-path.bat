@echo off
echo Adicionando Node.js ao PATH temporariamente...

REM Adicionar Node.js ao PATH da sessao atual
set PATH=%PATH%;C:\Program Files\nodejs\

echo PATH atualizado!
echo.
echo Testando Node.js:
node --version
echo.
echo Testando npm:
npm --version
echo.
echo Agora voce pode executar: npm run dev
echo.
pause

