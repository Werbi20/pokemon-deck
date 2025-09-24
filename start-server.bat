@echo off
echo ========================================
echo   Pokemon TCG Deck Manager
echo   Iniciando servidor de desenvolvimento...
echo ========================================
echo.

REM Verificar se o Node.js existe
if not exist "C:\Program Files\nodejs\node.exe" (
    echo ERRO: Node.js nao encontrado em C:\Program Files\nodejs\
    echo Por favor, instale o Node.js de https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se o npm existe
if not exist "C:\Program Files\nodejs\npm.cmd" (
    echo ERRO: npm nao encontrado em C:\Program Files\nodejs\
    echo Por favor, reinstale o Node.js
    pause
    exit /b 1
)

echo Node.js encontrado!
echo Versao do Node.js:
"C:\Program Files\nodejs\node.exe" --version

echo.
echo Versao do npm:
"C:\Program Files\nodejs\npm.cmd" --version

echo.
echo Iniciando servidor...
echo Acesse: http://localhost:3000
echo.
echo Para parar o servidor, pressione Ctrl+C
echo.

REM Executar o servidor
"C:\Program Files\nodejs\npm.cmd" run dev

echo.
echo Servidor parado.
pause

