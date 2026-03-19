# 🐉 Metin2 Web-Panel

Ein vollständiges, modernes Web-Panel für Metin2 Privatserver. Verwalte deinen Server bequem über den Browser — Item-Shop, Bann-System, und vieles mehr.

---

## 📋 Inhaltsverzeichnis

- [Features](#-features)
- [Voraussetzungen](#-voraussetzungen)
- [Installation](#-installation)
- [Konfiguration](#-konfiguration)
- [Starten](#-starten)
- [Projektstruktur](#-projektstruktur)
- [API-Endpunkte](#-api-endpunkte)
- [Datenbanken](#-datenbanken)
- [FAQ](#-faq)

---

## ✨ Features

### 🏠 Startseite
- Login & Registrierung mit animiertem UI
- Seitenname & Logo konfigurierbar über Admin-Panel
- Dark Mode / Light Mode Toggle
- Partikeleffekt-Hintergrund
- Responsive Design für alle Geräte

### 🛒 Item-Shop
- Items aus der `item_proto` mit VNUM-Suche hinzufügen
- **Zweitwährung**: DR (Drachenmünzen) und DM (Drachenmarken)
- **Cashback-System**: DM-Belohnung bei DR-Käufen (einstellbar pro Item)
- **Custom Items**: Sockets (Geiststeine) und bis zu 7 Boni pro Item konfigurierbar
- Kategorien-System (Waffen, Rüstungen, Schmuck, etc.)
- Item-Beschreibungen & Tooltip-Vorschau
- Item-Icons aus `/public/images/items/` (nach VNUM benannt)
- Live-Kontostand-Anzeige im Header (DR/DM)

### 🎒 Web-Lager (Stash)
- Gekaufte Items erscheinen im Web-Lager des Spielers
- Items mit allen Boni/Sockets werden korrekt gespeichert
- **Mülleimer-System**: Items löschen → 7 Tage Wiederherstellungsfrist
- Einzeln löschen, wiederherstellen oder endgültig entfernen
- Mehrfachauswahl mit "Alle auswählen"
- Detaillierte Item-Tooltips mit Boni-Anzeige
- Item-Abholung ins Ingame-MALL-Inventar


### 👤 Account-Verwaltung
- Passwort ändern (mit Metin2-kompatiblem SHA1-Hash)
- Löschcode (Social ID) ändern
- Übersicht: Maskierte E-Mail, Löschcode-Vorschau
- **Charaktere**: Alle Chars mit Level, EXP, Gold, Spielzeit, Klasse & Icon
- DR/DM-Kontostand im Navbar auf jeder Seite

### 📊 Rangliste
- Top-Spieler sortiert nach Level/EXP
- Klassen-Icons (Krieger, Ninja, Sura, Schamane)
- Reich-Filter (Shinsoo, Chunjo, Jinno)
- Suchfunktion

### 📥 Downloads
- Download-Manager über Admin-Panel steuerbar
- Titel, Beschreibung, URL, Icon & Farbe konfigurierbar
- Sortierung per Display-Order
- Standard-Downloads (Client, Patcher, Google Drive, Mega)

### 📄 CMS (Seiten-Editor)
- **AGB**, **Datenschutz**, **Impressum** — editierbar im Admin-Panel
- **Bann-Richtlinien** & **Serverregeln** — eigene Berechtigung erforderlich
- Rich-Text-Inhalte mit HTML-Support

### 🔒 Server Status
- Live-Serverübersicht (Channel, Online-Spieler, Ports)
- Erkennung ob Game-Server läuft oder offline ist

---

## 🛡️ Admin-Panel

### Tab-basierte Oberfläche
Das Admin-Panel ist in **4 Tabs** organisiert:

#### 📦 Tab 1: Shop & CMS
- Shop-Items hinzufügen/bearbeiten/löschen
- Item-Suche in der `item_proto` (nach Name oder VNUM)
- Custom Sockets & Boni pro Item setzen
- Kategorien verwalten (erstellen/löschen)
- Seiteneinstellungen (Servername, Logo)
- CMS-Seiten bearbeiten (AGB, Datenschutz, Impressum, Regeln)
- Download-Manager (hinzufügen/bearbeiten/löschen)

#### 🎁 Tab 2: Geschenke & Custom Items
- **DR/DM verschenken**: Beliebige Menge an jeden Account
- **Custom Items senden**: Item direkt ins MALL-Inventar eines Spielers legen
  - Unbegrenzte Boni-Werte (kein 100er-Limit wie im Shop)
  - Alle 7 Attribute + 3 Sockets konfigurierbar
- Ziel-Account per Dropdown auswählen

#### 👥 Tab 3: Spieler & Bans
- **Spielersuche** (nach Charaktername)
- **Account bannen**: Temporär (Tage) oder permanent
- **Account entbannen**: Status zurücksetzen
- **Bann-Historie**: Chronologische Übersicht aller Banns mit Admin, Grund & Datum
- Pflichtfeld: Begründung bei jedem Bann

#### 🔧 Tab 4: Team & Berechtigungen
- **Rollen-System**: IMPLEMENTOR, HIGH_WIZARD, GOD, LOW_WIZARD
- **5 granulare Berechtigungen** pro Rolle:
  - `can_manage_shop` — Shop & CMS verwalten
  - `can_give_gifts` — Items/Währung verschenken
  - `can_manage_players` — Spieler bannen/entbannen
  - `can_manage_team` — Rollen bearbeiten
  - `can_edit_rules` — Regelseiten bearbeiten
- **GM-Liste verwalten**: Game Master hinzufügen, bearbeiten, löschen
- **Ingame NPC Shops**: NPC-Shops erstellen & Items zuweisen


---

## 📋 Voraussetzungen

### 🐧 Linux (Ubuntu / Debian)

| Software | Version | Installationsbefehl |
|---|---|---|
| **OS** | Ubuntu 20.04+ / Debian 11+ | — |
| **Node.js** | 18+ | `curl -fsSL https://deb.nodesource.com/setup_20.x \| sudo -E bash - && sudo apt install -y nodejs` |
| **npm** | (mit Node.js) | `npm --version` |
| **MySQL/MariaDB** | 5.7+ / 10.3+ | `sudo apt install -y mariadb-server` |
| **Git** | (optional) | `sudo apt install -y git` |
| **PM2** | (optional) | `sudo npm install -g pm2` |
| **Firewall** | Port 3000 | `sudo ufw allow 3000/tcp` |

### 🪟 Windows

| Software | Version | Download |
|---|---|---|
| **OS** | Windows 10/11 oder Server 2019+ | — |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **npm** | (mit Node.js) | — |
| **MySQL/MariaDB** | 5.7+ / 10.3+ | Auf dem Game-Server |
| **Firewall** | Port 3000 TCP freigeben | Windows Defender Firewall |

### Metin2 Datenbanken (müssen bereits existieren):
- `account` — Account-Datenbank des Game-Servers
- `player` — Spieler-Datenbank mit `item_proto` und `player` Tabelle
- `common` — Enthält `gmlist` für Admin-Erkennung

---

## 🚀 Installation

### Option A: Setup-Assistent (Empfohlen)

1. **Dateien hochladen** auf deinen Server
2. **Pakete installieren**:
   ```bash
   cd metin2-web
   npm install
   ```
3. **Server starten**:
   ```bash
   node server.js
   ```
4. **Browser öffnen**: `http://deine-ip:3000`
   → Du wirst automatisch zum **Setup-Assistenten** weitergeleitet
5. **5 Schritte durchgehen**:
   - ✅ Voraussetzungen prüfen
   - ✅ Datenbank-Verbindung testen
   - ✅ Konfiguration speichern (.env wird erstellt)
   - ✅ Datenbank-Tabellen installieren
   - ✅ Fertig!

### Option B: Manuelle Installation

1. **Dateien hochladen**:
   ```bash
   git clone <repository-url> metin2-web
   cd metin2-web
   ```

2. **Pakete installieren**:
   ```bash
   npm install
   ```

3. **`.env` Datei erstellen**:
   ```env
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=dein_passwort
   DB_PORT=3306
   PORT=3000
   JWT_SECRET=ein_sehr_langer_geheimer_schluessel_hier
   JWT_EXPIRES=7d
   SETUP_DONE=true
   ```

4. **Datenbank-Tabellen erstellen**:
   ```bash
   node install_db.js
   ```

5. **Server starten**:
   ```bash
   npm start
   ```

---

## ⚙️ Konfiguration

### .env Datei

| Variable | Beschreibung | Standard |
|---|---|---|
| `DB_HOST` | MySQL/MariaDB Host | `127.0.0.1` |
| `DB_USER` | Datenbank-Benutzer | `root` |
| `DB_PASSWORD` | Datenbank-Passwort | — |
| `DB_PORT` | Datenbank-Port | `3306` |
| `PORT` | Web-Panel Port | `3000` |
| `JWT_SECRET` | Geheimer Schlüssel für Sessions | (auto-generiert) |
| `JWT_EXPIRES` | Token-Gültigkeit | `7d` |
| `SETUP_DONE` | Setup abgeschlossen? | `true` |

### Item-Bilder

Lege Item-Icons in `/public/images/items/` ab:
- Dateiname = VNUM mit führenden Nullen (5-stellig)
- Format: PNG
- Beispiel: Item VNUM `19` → `00019.png`
- Beispiel: Item VNUM `11299` → `11299.png`

---

## ▶️ Starten

### Entwicklung
```bash
npm start
# oder
node server.js
```

### Produktion (Linux + PM2)
```bash
pm2 start server.js --name metin2-web
pm2 save
pm2 startup
```

### Produktion (Windows)
```bash
# Als Administrator:
npm install -g pm2
pm2 start server.js --name metin2-web
pm2 save
```

---

## 📁 Projektstruktur

```
metin2-web/
├── server.js              # Express-Server & Auto-DB-Setup
├── database.js            # MySQL2 Connection Pool
├── install_db.js          # Standalone Datenbank-Setup Skript
├── package.json           # Node.js Abhängigkeiten
├── .env                   # Konfiguration (wird vom Setup erstellt)
│
├── routes/
│   ├── auth.js            # Login, Register, Passwort, Löschcode, Charaktere
│   ├── shop.js            # Shop-Items laden, kaufen, Settings, Kategorien
│   ├── admin.js           # Admin-Panel (Shop, Gifts, Bans, Permissions, CMS)
│   ├── stash.js           # Web-Lager (Items, Trash, Abholen)

│   ├── server.js          # GM-Liste, NPC-Shops verwalten
│   ├── setup.js           # Setup-Assistent API
│   ├── public.js          # Öffentliche Routen (Downloads, Ranking)
│   └── middleware/
│       └── auth.js        # JWT Auth Middleware
│
├── public/
│   ├── index.html         # Startseite (Login/Register)
│   ├── shop.html          # Item-Shop
│   ├── stash.html         # Web-Lager

│   ├── admin.html         # Admin-Panel (geschützt)
│   ├── account.html       # Account-Einstellungen
│   ├── ranking.html       # Rangliste
│   ├── downloads.html     # Downloads
│   ├── server.html        # Server-Status
│   ├── page.html          # CMS-Seiten (AGB, etc.)
│   ├── setup.html         # Setup-Assistent
│   ├── css/
│   │   └── style.css      # Globale Styles
│   ├── js/
│   │   ├── main.js        # Auth, Shop-Logik, Navbar, Balance
│   │   └── theme.js       # Dark/Light Mode Toggle
│   └── images/
│       └── items/         # Item-Icons (VNUM.png)
```

---

## 🔌 API-Endpunkte

### Auth (`/api/auth`)
| Methode | Route | Beschreibung |
|---|---|---|
| POST | `/register` | Neuen Account erstellen |
| POST | `/login` | Login (gibt JWT Token zurück) |
| GET | `/me` | Aktuellen Kontostand abrufen |
| GET | `/settings` | Maskierte E-Mail & Social ID |
| POST | `/update-password` | Passwort ändern |
| POST | `/update-social-id` | Löschcode ändern |
| GET | `/characters` | Alle Charaktere des Accounts |

### Shop (`/api/shop`)
| Methode | Route | Beschreibung |
|---|---|---|
| GET | `/items` | Alle aktiven Shop-Items |
| POST | `/buy` | Item kaufen (DR oder DM) |
| GET | `/settings` | Seiten-Einstellungen |
| GET | `/categories` | Alle Kategorien |
| GET | `/pages/:slug` | CMS-Seite laden |

### Stash (`/api/stash`)
| Methode | Route | Beschreibung |
|---|---|---|
| GET | `/items` | Web-Lager Items laden |
| GET | `/trash` | Mülleimer laden |
| POST | `/deliver` | Item ins Spiel abholen |
| POST | `/delete` | Item in Mülleimer verschieben |
| POST | `/restore` | Item wiederherstellen |
| DELETE | `/destroy/:id` | Item endgültig löschen |
| POST | `/bulk-delete` | Mehrere Items löschen |
| POST | `/bulk-destroy` | Mehrere Items endgültig löschen |

### Admin (`/api/admin`)
| Methode | Route | Beschreibung |
|---|---|---|
| GET | `/check` | Admin-Status prüfen |
| GET/POST | `/settings` | Seiten-Einstellungen |
| GET/POST | `/pages/:slug` | CMS-Seiten |
| GET/POST/PUT/DELETE | `/items` | Shop-Items CRUD |
| GET/POST/DELETE | `/categories` | Kategorien verwalten |
| GET/POST/PUT/DELETE | `/downloads` | Downloads verwalten |
| POST | `/give-dr` | DR verschenken |
| POST | `/give-dm` | DM verschenken |
| POST | `/give-custom-item` | Custom Item senden |
| GET | `/search-item` | Item-Suche |
| GET | `/accounts` | Alle Accounts |
| GET/POST | `/permissions` | Rollen-Berechtigungen |
| GET | `/bans/history` | Bann-Historie |
| POST | `/bans/account` | Account bannen |
| POST | `/bans/unban` | Account entbannen |
| GET | `/search-player` | Spieler suchen |

### Server (`/api/server`)
| Methode | Route | Beschreibung |
|---|---|---|
| GET/POST/DELETE | `/gmlist` | GM-Liste verwalten |
| GET | `/shops` | NPC-Shops laden |
| POST | `/shops` | NPC-Shop erstellen |
| DELETE | `/shops/:vnum` | NPC-Shop löschen |
| PUT | `/shops/:vnum/items` | Shop-Items aktualisieren |

---

## 🗄️ Datenbanken

### Von `install_db.js` erstellt:

| Tabelle | Datenbank | Beschreibung |
|---|---|---|
| `shop_categories` | website | Kategorien für den Item-Shop |
| `shop_items` | website | Shop-Artikel mit Boni & Sockets |
| `web_stash` | website | Web-Lager (gekaufte Items, Trash) |
| `site_settings` | website | Servername, Logo |
| `site_pages` | website | CMS-Seiten (AGB, DSGVO, etc.) |
| `admin_permissions` | website | Rollen & Berechtigungen |
| `ban_history` | website | Bann-Protokoll |
| `downloads` | website | Download-Links |


### Voraussetzung (Game-Server):
| Tabelle | Datenbank | Beschreibung |
|---|---|---|
| `account` | account | Spieler-Accounts |
| `item_proto` | player | Item-Definitionen (Namen, VNUM) |
| `player` | player | Spieler-Charaktere |
| `item` | player | Spieler-Items (MALL) |
| `gmlist` | common | Game Master Liste |

---

## ❓ FAQ

**Q: Der Server startet, aber die Seite zeigt nichts an?**
> Prüfe ob Port 3000 in der Firewall freigegeben ist und ob die `.env` Datei existiert.

**Q: Items werden ohne Namen angezeigt?**
> Die `player.item_proto` Tabelle muss auf dem gleichen MySQL-Server erreichbar sein.

**Q: Wie werde ich Admin?**
> Dein Account muss in `common.gmlist` als `IMPLEMENTOR` eingetragen sein. Das kannst du im Admin-Panel unter Tab 4 machen, sobald du einmalig manuell eingetragen bist.

**Q: Items zeigen kein Bild?**
> Lege die Item-Icons als PNG in `/public/images/items/` ab (z.B. `00019.png` für VNUM 19).

**Q: Kann ich den Port ändern?**
> Ja, ändere `PORT=3000` in der `.env` Datei und starte den Server neu.

**Q: Wie sichere ich den Server für Produktion ab?**
> Nutze einen Reverse Proxy (nginx/Apache) mit SSL-Zertifikat vor dem Node.js-Server.

---

## 📝 Lizenz

Dieses Projekt ist für den privaten Gebrauch auf Metin2 Privatservern gedacht.

---

*Erstellt mit ❤️ für die Metin2 Community*
