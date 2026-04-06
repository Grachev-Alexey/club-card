#!/bin/bash

# Скрипт для деплоя приложения
set -e

echo "🚀 Starting deployment..."

# Переходим в директорию проекта
cd /var/www/club-cards

# Останавливаем приложение
echo "⏹️ Stopping application..."
pm2 stop club-cards-app || true

# Устанавливаем зависимости
echo "📦 Installing dependencies..."
npm ci --production

# Собираем проект
echo "🔨 Building application..."
npm run build

# Применяем миграции базы данных
echo "🗄️ Running database migrations..."
npm run db:migrate

# Запускаем приложение
echo "▶️ Starting application..."
pm2 start ecosystem.config.js

# Сохраняем конфигурацию PM2
pm2 save

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running at https://club-sarafan.ru"