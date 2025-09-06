#!/bin/bash

# Script de Deploy para Vercel - Essential Factor 5P Platform

echo "🚀 Iniciando processo de deploy..."

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Limpar build anterior
echo "🧹 Limpando build anterior..."
rm -rf dist

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Executar build
echo "🔨 Executando build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Deploy para produção
    echo "🚀 Fazendo deploy para produção..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deploy concluído com sucesso!"
        echo "📱 Sua aplicação está disponível em: https://essential-factor-5p.vercel.app"
    else
        echo "❌ Erro durante o deploy"
        exit 1
    fi
else
    echo "❌ Erro durante o build"
    exit 1
fi