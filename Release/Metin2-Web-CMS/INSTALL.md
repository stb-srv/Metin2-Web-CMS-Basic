# 🚀 Metin2 Web-CMS: Installations- & Setup-Guide

Willkommen zur offiziellen Installationsanleitung für das **Metin2 Web-CMS Basic**. 
Diese Anleitung führt dich Schritt für Schritt von einem leeren Server bis hin zur fertig eingerichteten Webseite.

---

## 1️⃣ Voraussetzungen (Server Vorbereitung)

Das CMS benötigt einen Server (vServer / Root-Server) mit einem der folgenden Betriebssysteme:
- **Ubuntu** (20.04 oder neuer empfohlen)
- **Debian** (11 oder neuer empfohlen)
- **FreeBSD** (bis Version 13)

Zusätzlich muss dein **Metin2 Game-Server (MySQL/MariaDB)** erreichbar sein. Die Datenbanken `account`, `player` und `common` müssen bereits existieren.

---

## 2️⃣ Projekt herunterladen (Clonen)

Logge dich per SSH auf deinem Webserver ein. Lade das Projekt direkt von GitHub in das gewünschte Verzeichnis (z.B. `/var/www/metin2-web` oder `/home/metin2-web`):

```bash
# Wechsle in dein Wunschverzeichnis
cd /home

# Klone das GitHub Repository
git clone https://github.com/stb-srv/Metin2-Web-CMS-Basic.git metin2-web

# Wechsle in den neuen Ordner
cd metin2-web
```

---

## 3️⃣ Abhängigkeiten installieren (Automatisches Skript)

Wir haben ein automatisiertes Skript (`install.sh`) beigefügt, das dein System prüft und fehlende Kern-Komponenten (**Node.js 18+, NPM, PM2**) automatisch installiert.

Führe das Skript mit Root-Rechten aus:

```bash
# Mache das Skript ausführbar
chmod +x install.sh

# Führe das Setup-Skript aus
sudo ./install.sh
```
*Das Skript erkennt automatisch, ob du Ubuntu/Debian oder FreeBSD nutzt. Bestätige die Installation fehlender Pakete einfach mit `y`.*

---

## 4️⃣ Node-Pakete installieren

Nachdem Node.js und NPM installiert sind, müssen die spezifischen Pakete für das CMS heruntergeladen werden. Stelle sicher, dass du dich im Ordner `metin2-web` befindest:

```bash
npm install
```

---

## 5️⃣ CMS Starten & Web-Setup ausführen

Das CMS bringt einen komfortablen **Web-Setup-Assistenten** mit. Du musst keine Datenbank-Tabellen manuell anlegen oder Konfigurationsdateien per Hand schreiben!

Starte den Server zunächst im Entwicklungsmodus:

```bash
npm start
```

1. Öffne nun deinen Webbrowser und rufe die IP deines Webservers (oder deine Domain) auf Port 3000 auf:
   👉 **`http://DEINE-SERVER-IP:3000`**
2. Du wirst automatisch zum Setup-Assistenten weitergeleitet.
3. Trage dort die Zugangsdaten zu deiner Metin2 MySQL/MariaDB Datenbank ein.
4. Der Assistent erstellt automatisch die `.env` Datei und alle benötigten CMS-Tabellen (`shop_items`, `ban_history`, etc.) in der neuen `website` Datenbank.

*Beende den Server nach erfolgreichem Setup in der Konsole mit `STRG + C` (bzw. `CTRL + C`).*

---

## 6️⃣ Produktivbetrieb (PM2)

Damit die Webseite dauerhaft im Hintergrund weiterläuft, auch wenn du die SSH-Konsole schließt, nutzen wir den Prozessmanager **PM2** (wurde durch `install.sh` bereits installiert).

Starte das CMS produktiv:

```bash
# Starte den Server im Hintergrund
pm2 start server.js --name metin2-web

# Speichere die aktuellen PM2 Prozesse
pm2 save

# (Optional) Sorge dafür, dass PM2 nach einem Server-Neustart automatisch startet
pm2 startup
```

---

## 🎉 Herzlichen Glückwunsch!
Deine Webseite ist nun online und unter `http://DEINE-SERVER-IP:3000` erreichbar. 

### Wichtige Nacharbeiten:
- **Port ändern:** Möchtest du Port 80 (Standard HTTP) nutzen, öffne die Datei `.env` mit `nano .env`, ändere `PORT=3000` zu `PORT=80` und starte den Server neu (`pm2 restart metin2-web`). *Beachte, dass der Node-Prozess dafür Root-Rechte bzw. Port-Forwarding via iptables/nginx benötigt.*
- **Admin-Rechte:** Um Zugang zum Admin-Panel (`/admin`) zu erhalten, muss dein Ingame-Charakter in der Datenbank `common.gmlist` die Rolle `IMPLEMENTOR` besitzen.
- **Firewall:** Vergiss nicht, den entsprechenden Port (z.B. 3000 oder 80) in deiner Firewall freizugeben (`sudo ufw allow 3000`).
