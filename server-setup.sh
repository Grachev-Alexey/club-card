#!/bin/bash

# Скрипт для первоначальной настройки сервера
set -e

echo "🔧 Setting up server for Club Cards application..."

# Обновляем систему
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Устанавливаем необходимые пакеты
echo "📦 Installing required packages..."
sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release

# Устанавливаем Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Устанавливаем PostgreSQL
echo "🗄️ Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Устанавливаем Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Устанавливаем PM2 глобально
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# Устанавливаем Certbot для SSL
echo "🔒 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Создаем пользователя для базы данных
echo "👤 Setting up database user..."
sudo -u postgres psql -c "CREATE USER club_cards_user WITH PASSWORD 'STRONG_PASSWORD_HERE';"
sudo -u postgres psql -c "CREATE DATABASE club_cards_db OWNER club_cards_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE club_cards_db TO club_cards_user;"

# Создаем директорию для приложения
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/club-cards
sudo chown -R $USER:$USER /var/www/club-cards

# Создаем директорию для логов
mkdir -p /var/www/club-cards/logs

# Настраиваем автозапуск PM2
echo "🔄 Setting up PM2 startup..."
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

echo "✅ Server setup completed!"
echo "📝 Next steps:"
echo "1. Upload your application files to /var/www/club-cards"
echo "2. Copy nginx.conf to /etc/nginx/sites-available/club-cards"
echo "3. Enable the site: sudo ln -s /etc/nginx/sites-available/club-cards /etc/nginx/sites-enabled/"
echo "4. Get SSL certificate: sudo certbot --nginx -d club-sarafan.ru -d www.club-sarafan.ru"
echo "5. Run deploy.sh to start the application"