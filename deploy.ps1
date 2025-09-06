# Script de Deploy para Vercel - Essential Factor 5P Platform

Write-Host "🚀 Iniciando processo de deploy..." -ForegroundColor Green

# Verificar se o Vercel CLI está instalado
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "📦 Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Limpar build anterior
Write-Host "🧹 Limpando build anterior..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm install

# Executar build
Write-Host "🔨 Executando build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green
    
    # Deploy para produção
    Write-Host "🚀 Fazendo deploy para produção..." -ForegroundColor Green
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 Deploy concluído com sucesso!" -ForegroundColor Green
        Write-Host "📱 Sua aplicação está disponível em: https://essential-factor-5p.vercel.app" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erro durante o deploy" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Erro durante o build" -ForegroundColor Red
    exit 1
}