#!/usr/bin/env bash
# =====================================================================
# Elite Bot & OpenClaw — Script de Deploy Automatizado para Hostinger VPS
# =====================================================================

set -e

echo "🚀 [1/5] Iniciando Deploy do Elite Bot + OpenClaw no Hostinger VPS..."

# Check se docker está instalado
if ! command -v docker &> /dev/null; then
    echo "⚠️ Docker não encontrado. Instalando Docker Engine..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "✅ Docker instalado com sucesso!"
fi

# Check se docker compose v2 está disponível
if ! docker compose version &> /dev/null; then
    echo "⚠️ Docker Compose plugin não encontrado. Instalando..."
    sudo apt-get update && sudo apt-get install -y docker-compose-plugin
fi

# Verificar arquivo .env.prod
if [ ! -f ".env.prod" ]; then
    echo "❌ Arquivo .env.prod não encontrado!"
    echo "📋 Copiando .env.prod.example para .env.prod..."
    cp .env.prod.example .env.prod
    echo "⚠️ Por favor, edite o arquivo .env.prod com suas senhas e domínios antes de rodar novamente."
    exit 1
fi

# Carregar variáveis de ambiente
source .env.prod

echo "📦 [2/5] Baixando e Compilando Containers no Motor Docker..."
docker compose --env-file .env.prod -f docker-compose.prod.yml build --no-cache

echo "🔄 [3/5] Subindo a Stack Completa (Postgres, PostgREST, Worker, OpenClaw, Caddy)..."
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d

echo "⏳ [4/5] Aguardando inicialização do Banco de Dados..."
sleep 8

echo "⚡ [5/5] Aplicando Migrações SQL, RLS e Funções RPC no PostgreSQL..."
docker exec -i elitebot-postgres-prod psql -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-elitebot} < database/migrations/001_initial_schema.sql
docker exec -i elitebot-postgres-prod psql -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-elitebot} < database/migrations/002_security.sql
docker exec -i elitebot-postgres-prod psql -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-elitebot} < database/migrations/003_seed_catalog.sql
docker exec -i elitebot-postgres-prod psql -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-elitebot} < database/migrations/004_rpc_match_product.sql

# Atualiza a senha da role 'authenticator' com a variável segura do .env.prod
if [ -n "$AUTHENTICATOR_PASSWORD" ]; then
    echo "🔒 Configurando a senha da role 'authenticator' para o PostgREST RLS..."
    docker exec -i elitebot-postgres-prod psql -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-elitebot} -c "ALTER ROLE authenticator WITH PASSWORD '${AUTHENTICATOR_PASSWORD}';"
fi

# Reinicia o container do postgrest para garantir que a nova conexão autenticada entre
docker compose --env-file .env.prod -f docker-compose.prod.yml restart postgrest

echo "✨ Deploy Concluído com Sucesso!"
echo "--------------------------------------------------------"
echo "🌐 API PostgREST:   https://${API_DOMAIN:-api.seusite.com}"
echo "🔗 Redirect Server: https://${REDIRECT_DOMAIN:-click.seusite.com}"
echo "🦀 OpenClaw Engine:  https://${OPENCLAW_DOMAIN:-claw.seusite.com}"
echo "--------------------------------------------------------"
echo "📊 Para verificar logs em tempo real: docker compose -f docker-compose.prod.yml logs -f"
