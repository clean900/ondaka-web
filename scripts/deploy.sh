#!/bin/bash
# ============================================================
# ONDAKA — Script de Deploy para cPanel LiteSpeed
# Soluções Simples © 2026
# ============================================================
# Uso: ./deploy.sh
# Deve correr na raiz do projecto no servidor
# ============================================================

set -e  # parar imediatamente em caso de erro

echo "======================================"
echo "  ONDAKA — Deploy"
echo "======================================"

# Verificar que estamos no sítio certo
if [ ! -f "artisan" ]; then
    echo "❌ Erro: este script deve correr na raiz do projecto Laravel."
    exit 1
fi

# 1. Modo manutenção
echo ""
echo "→ Activando modo manutenção..."
php artisan down --render="errors::503" --retry=60 || true

# 2. Puxar código novo
echo ""
echo "→ A puxar alterações do Git..."
git pull origin main

# 3. Instalar dependências PHP (sem dev, optimizado)
echo ""
echo "→ A instalar dependências PHP..."
composer install --no-dev --optimize-autoloader --no-interaction

# 4. Migrations
echo ""
echo "→ A aplicar migrations..."
php artisan migrate --force --no-interaction

# 5. Limpar caches antigos
echo ""
echo "→ A limpar caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear || true

# 6. Reconstruir caches optimizados
echo ""
echo "→ A reconstruir caches de produção..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 7. Storage link (se ainda não existir)
if [ ! -L "public/storage" ]; then
    echo ""
    echo "→ A criar storage link..."
    php artisan storage:link
fi

# 8. Permissões
echo ""
echo "→ A ajustar permissões..."
chmod -R 755 storage bootstrap/cache 2>/dev/null || true
chmod -R 775 storage/logs storage/framework 2>/dev/null || true

# 9. Reiniciar fila
echo ""
echo "→ A reiniciar filas..."
php artisan queue:restart || true

# 10. Sair do modo manutenção
echo ""
echo "→ A retomar serviço..."
php artisan up

echo ""
echo "======================================"
echo "  ✓ Deploy concluído com sucesso!"
echo "======================================"
echo ""
echo "Acessar: https://ondaka.ao"
echo ""
