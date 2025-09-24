# Pokemon TCG Deck Manager - Script de Inicialização
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Pokemon TCG Deck Manager" -ForegroundColor Yellow
Write-Host "   Iniciando servidor de desenvolvimento..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o Node.js existe
$nodePath = "C:\Program Files\nodejs\node.exe"
$npmPath = "C:\Program Files\nodejs\npm.cmd"

if (-not (Test-Path $nodePath)) {
    Write-Host "ERRO: Node.js não encontrado em $nodePath" -ForegroundColor Red
    Write-Host "Por favor, instale o Node.js de https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

if (-not (Test-Path $npmPath)) {
    Write-Host "ERRO: npm não encontrado em $npmPath" -ForegroundColor Red
    Write-Host "Por favor, reinstale o Node.js" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "Node.js encontrado!" -ForegroundColor Green
Write-Host "Versão do Node.js:" -ForegroundColor White
& $nodePath --version

Write-Host ""
Write-Host "Versão do npm:" -ForegroundColor White
& $npmPath --version

Write-Host ""
Write-Host "Iniciando servidor..." -ForegroundColor Green
Write-Host "Acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para parar o servidor, pressione Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Executar o servidor
try {
    & $npmPath run dev
} catch {
    Write-Host "Erro ao executar o servidor: $_" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
}

