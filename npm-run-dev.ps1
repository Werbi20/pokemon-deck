# Pokemon TCG Deck Manager - npm run dev
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Pokemon TCG Deck Manager" -ForegroundColor Yellow
Write-Host "   Executando: npm run dev" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Adicionar Node.js ao PATH da sessão atual
$env:PATH += ";C:\Program Files\nodejs\"

Write-Host "PATH atualizado com Node.js" -ForegroundColor Green
Write-Host ""

# Verificar se funciona
Write-Host "Testando Node.js:" -ForegroundColor White
node --version

Write-Host ""
Write-Host "Testando npm:" -ForegroundColor White
npm --version

Write-Host ""
Write-Host "Executando: npm run dev" -ForegroundColor Green
Write-Host "Acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Para parar: Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Executar o comando
try {
    npm run dev
} catch {
    Write-Host "Erro ao executar npm run dev: $_" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
}

