#!/bin/bash
# Deployment-Skript für Hetzner Ubuntu Server
# Einmalig ausführen nach SSH-Login auf dem Server

echo "=== SPD Fraktion KL – Setup ==="

# System updaten
apt update && apt upgrade -y

# Python & pip
apt install -y python3 python3-pip python3-venv nginx

# App-Verzeichnis
mkdir -p /opt/fraktion
cd /opt/fraktion

# Venv erstellen
python3 -m venv venv
source venv/bin/activate

# Dependencies installieren
pip install -r requirements.txt

# Systemd Service erstellen
cat > /etc/systemd/system/fraktion.service << EOF
[Unit]
Description=SPD Fraktion KL Portal
After=network.target

[Service]
User=root
WorkingDirectory=/opt/fraktion
ExecStart=/opt/fraktion/venv/bin/python run.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Service aktivieren
systemctl daemon-reload
systemctl enable fraktion
systemctl start fraktion

# Nginx als Reverse Proxy
cat > /etc/nginx/sites-available/fraktion << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    client_max_body_size 50M;
}
EOF

ln -sf /etc/nginx/sites-available/fraktion /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo ""
echo "=== Fertig! ==="
echo "Die App läuft jetzt und ist über http://SERVER-IP erreichbar"
echo "Passwort zum Einloggen: $(grep APP_PASSWORD /opt/fraktion/.env | cut -d= -f2)"
