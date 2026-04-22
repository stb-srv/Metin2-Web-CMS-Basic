<div align="center">
  <img src="public/images/docs/banner.png" alt="Metin2 Web CMS Banner" width="100%">
  
  # 🐉 Metin2 Web-CMS (Basic Edition)
  
  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)](https://github.com/stb-srv/Metin2-Web-CMS-Basic)
  [![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)](LICENSE)
  [![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

  **Ein vollständiges, modernes und performantes Web-Panel für Metin2 Privatserver.**  
  *Verwalte deinen Server, deinen Item-Shop und deine Spieler mit Leichtigkeit.*
</div>

---

## 🌟 Überblick

Das **Metin2 Web-CMS** ist eine leichtgewichtige, aber mächtige Lösung für Serverbetreiber, die eine moderne Weboberfläche ohne unnötigen Ballast suchen. Es bietet ein integriertes Shop-System, Account-Management, Ranglisten und ein umfassendes Admin-Dashboard.

### ✨ Kern-Features

#### 🏠 Frontend & User-Experience
- **Modernes UI/UX**: Vollständig responsives Design mit Dark- & Light-Mode.
- **Interaktive Startseite**: Login & Registrierung mit flüssigen Animationen und Partikel-Effekten.
- **Live-Statistiken**: Echtzeit-Anzeige des Server-Status (Online-Spieler, Channel-Status).

#### 🛒 Item-Shop & Web-Lager
- **Vollwertiger Shop**: Unterstützung für DR (Drachenmünzen) und DM (Drachenmarken).
- **Cashback-System**: Automatische DM-Belohnungen bei Käufen mit DR.
- **Customization**: Sockets (Steine) und bis zu 7 Boni pro Item konfigurierbar.
- **Web-Lager (Stash)**: Gekaufte Items sicher zwischenlagern, abholen oder im Mülleimer (7 Tage Frist) verwalten.

#### 👤 Account-Management
- **Sicherheit**: Passwort-Hashing kompatibel mit Metin2 SHA1.
- **Self-Service**: Löschcode (Social ID) und Passwort bequem über den Browser ändern.
- **Charakter-Übersicht**: Detaillierte Ansicht aller Charaktere inkl. Level, Klasse und Spielzeit.

#### 🛡️ Admin-Power
- **Intuitive Verwaltung**: Tab-basiertes Interface für Shop, CMS, Spieler und Team.
- **Geschenk-System**: Sende Items oder Währungen direkt an Accounts.
- **Bann-Management**: Umfassende Historie und einfache Sperrung von Accounts.
- **Rollen-System**: Granulare Berechtigungen für verschiedene Team-Ränge.

---

## 🛠️ Technologie-Stack

| Komponente | Technologie |
|---|---|
| **Backend** | [Node.js](https://nodejs.org/) mit [Express.js](https://expressjs.com/) |
| **Datenbank** | [MySQL](https://www.mysql.com/) / [MariaDB](https://mariadb.org/) |
| **Frontend** | Vanilla JS, HTML5, CSS3 (Modern UI) |
| **Auth** | JSON Web Tokens (JWT) & Cookie-Parsing |
| **Logging** | Winston & Daily Rotate Files |

---

## 🚀 Schnellstart

### Schritt 1: Ubuntu/Debian vorbereiten
Bevor du das Repository klonst, müssen einige grundlegende Pakete auf deinem System installiert sein:

```bash
sudo apt update && sudo apt install -y git curl
```

> [!NOTE]
> Node.js, NPM und PM2 werden automatisch durch das Installations-Skript eingerichtet. `git` und `curl` müssen jedoch manuell vorab installiert werden.

### Schritt 2: Repository klonen
Lade den Quellcode auf deinen Server herunter:

```bash
git clone https://github.com/stb-srv/Metin2-Web-CMS-Basic.git
cd Metin2-Web-CMS-Basic
```

### Schritt 3: install.sh ausführen
Das Skript prüft dein Betriebssystem und installiert automatisch Node.js 20, NPM und PM2.

```bash
chmod +x install.sh
sudo ./install.sh
```

> [!TIP]
> Das Skript unterstützt Ubuntu, Debian und FreeBSD. Nach der ersten erfolgreichen Installation kannst du es erneut ausführen, um die Installation zu verifizieren.

### Schritt 4: npm install ausführen
Installiere die Projektabhängigkeiten:

```bash
npm install
```

### Schritt 5: .env konfigurieren
Erstelle deine Konfigurationsdatei und passe sie an:

```bash
cp .env.example .env
nano .env
```

**Wichtige Felder:**
- **DB_HOST, DB_USER, DB_PASSWORD**: Deine Metin2-Datenbankzugangsdaten.
- **DB_SCHEMA_ACCOUNT / PLAYER / WEBSITE**: Die Namen deiner Schemas (Standard: `account`, `player`, `website`).
- **DB_COLUMN_DR / DB_COLUMN_DM**: Spaltennamen für Coins/Cash in der `account`-Tabelle.
- **JWT_SECRET**: Ein langer, zufälliger String (Absolut notwendig für `production`).
- **APP_URL**: Die vollständige URL deiner Website (z.B. `https://deine-domain.de`).
- **NODE_ENV**: Setze `"development"` für lokale Tests oder `"production"` für den Live-Betrieb.

### Schritt 6: Server starten
Verwende PM2, um den Server im Hintergrund zu betreiben und bei Systemstarts automatisch neuzustarten:

```bash
pm2 start server.js --name metin2-cms
pm2 save
pm2 startup
```

Besuche nun `http://DEINE-IP:3000` in deinem Browser. Der Web-Setup-Wizard wird dich durch die restliche Konfiguration führen.

---

## ⚠️ Bekannte Hinweise

1. **Lokales Testen (HTTP ohne HTTPS)**
   Wenn du das CMS lokal oder im LAN ohne HTTPS testest (z.B. `http://192.168.x.x:3000`), musst du in der `.env` zwingend setzen:
   ```env
   NODE_ENV=development
   ```
   > [!IMPORTANT]
   > Im `production`-Modus wird der Login-Cookie mit `secure: true` gesetzt. Das bedeutet, der Browser akzeptiert ihn nur über HTTPS. Ohne diese Einstellung wirst du nach dem Login sofort wieder ausgeloggt. Für den Live-Betrieb mit SSL/HTTPS nutze `NODE_ENV=production`.

2. **JWT_SECRET in production**
   Im `production`-Modus wird der Server beim Start sofort beendet (`process.exit`), wenn `JWT_SECRET` nicht gesetzt ist oder noch den Standard-Wert `"secret"` hat. Generiere einen sicheren Wert z.B. mit:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Datenbank-Schema-Namen**
   Standardmäßig werden die Namen `account`, `player`, `common` und `website` erwartet. Sollte deine Datenbank andere Namen verwenden (z.B. `metin2_account`), passe die `DB_SCHEMA_*` Variablen in der `.env` entsprechend an.

4. **web_pass_hash Spalte**
   Das CMS benötigt eine zusätzliche Spalte `web_pass_hash` in der Tabelle `account.account`. Diese wird vom Setup-Wizard automatisch angelegt. Falls sie manuell fehlt:
   ```sql
   ALTER TABLE account.account ADD COLUMN web_pass_hash VARCHAR(255) DEFAULT NULL;
   ```

---

## 📁 Projektstruktur

```text
Metin2-Web-CMS-Basic/
├── server/
│   ├── config/          # Datenbank, RateLimiter, Setup-Logik
│   ├── middleware/       # Auth, Validation, AsyncHandler
│   ├── modules/          # Feature-Module (auth, web-shop, stash, votes, ...)
│   └── utils/            # Logger, Passwort-Hashing, E-Mail
├── public/               # Frontend (HTML, CSS, JS, Bilder)
├── server.js             # Haupteinstiegspunkt
├── install.sh            # Dependency-Installer (Node.js, NPM, PM2)
├── .env.example          # Vorlage für Umgebungsvariablen
└── INSTALL.md            # Detaillierte Installationsanleitung
```

---

## 📝 Lizenz & Support

Dieses Projekt ist unter der **MIT-Lizenz** lizenziert. Es ist für den privaten Gebrauch und die Metin2-Community bestimmt.

**Entwickelt mit ❤️ für die Metin2-Community.**
