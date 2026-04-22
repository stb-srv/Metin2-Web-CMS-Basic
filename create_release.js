const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = __dirname;
const RELEASE_DIR_NAME = 'Release';
const RELEASE_FOLDER_NAME = 'Metin2-Web-CMS';
const RELEASE_DIR = path.join(PROJECT_DIR, RELEASE_DIR_NAME);
const TARGET_DIR = path.join(RELEASE_DIR, RELEASE_FOLDER_NAME);

// Was soll NICHT in den Release-Ordner kopiert werden?
const IGNORE_LIST = [
    '.git',
    '.gitignore',
    '.gitattributes',
    '.env', // Wichtig: Niemals die eigene .env Datei publizieren!
    'logs',
    'tmp',
    'Release',
    'create_release.js',
    'test_setup.js',
    'tmp_fix_db.js',
    '.vscode',
    'package-lock.json',
	'create_release.bat',
    '.gemini'
];

async function removeDir(dirPath) {
    try {
        await fs.rm(dirPath, { recursive: true, force: true });
    } catch (e) {
        // Ignore if not exists
    }
}

async function copyRecursive(src, dest) {
    const stats = await fs.stat(src);
    const isDir = stats.isDirectory();

    const basename = path.basename(src);
    if (IGNORE_LIST.includes(basename)) {
        return; // Skip ignored files/folders
    }

    // Leere den Upload-Ordner (behalte aber den Ordner selbst)
    if (isDir && basename === 'uploads') {
        await fs.mkdir(dest, { recursive: true });
        // Optional: Leere index.html oder .gitkeep anlegen
        await fs.writeFile(path.join(dest, '.gitkeep'), '');
        return;
    }

    if (isDir) {
        await fs.mkdir(dest, { recursive: true });
        const items = await fs.readdir(src);
        for (const childItemName of items) {
            await copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
        }
    } else {
        await fs.copyFile(src, dest);
    }
}

async function start() {
    console.log('[1/4] Bereinige alten Release-Ordner...');
    await removeDir(RELEASE_DIR);
    await fs.mkdir(TARGET_DIR, { recursive: true });

    console.log('[2/4] Kopiere Projektdateien in den Release-Ordner...');
    const items = await fs.readdir(PROJECT_DIR);
    for (const item of items) {
        await copyRecursive(path.join(PROJECT_DIR, item), path.join(TARGET_DIR, item));
    }
    
    // Stelle sicher dass die leeren Ordner existieren
    await fs.mkdir(path.join(TARGET_DIR, 'logs'), { recursive: true }).catch(()=>{});
    await fs.mkdir(path.join(TARGET_DIR, 'tmp'), { recursive: true }).catch(()=>{});
    await fs.mkdir(path.join(TARGET_DIR, 'public', 'uploads'), { recursive: true }).catch(()=>{});
    await fs.writeFile(path.join(TARGET_DIR, 'logs', '.gitkeep'), '');
    await fs.writeFile(path.join(TARGET_DIR, 'tmp', '.gitkeep'), '');

    console.log('[3/4] Erstelle fertige ZIP-Datei...');
    const zipPath = path.join(RELEASE_DIR, 'Metin2-Web-CMS-v1.0.0.zip');
    
    // Windows PowerShell ZIP Commander
    const isWindows = process.platform === 'win32';
    
    try {
        if (isWindows) {
            // Fhre Windows PowerShell Compress-Archive aus
            execSync(`powershell -Command "Compress-Archive -Path '${TARGET_DIR}\\*' -DestinationPath '${zipPath}' -Force"`, { stdio: 'inherit' });
        } else {
            // Linux MacOS Zip Befehl
            execSync(`cd "${TARGET_DIR}" && zip -r "${zipPath}" .`, { stdio: 'inherit' });
        }
        console.log(`[4/4] ✅ ERFOLG! ZIP-Datei erstellt unter: ${zipPath}`);
        console.log(`\nDu kannst jetzt den Ordner "Release" öffnen und die ZIP-Datei "Metin2-Web-CMS-v1.0.0.zip" hochladen or an andere senden!`);
        console.log(`Die Empfänger müssen nur noch die ZIP entpacken, "npm install" ausführen und können direkt durchstarten (Plug and Play).`);
    } catch (err) {
        console.error('FEHLER beim Zippen:', err.message);
        console.log(`[!] Die fertig gepackten Dateien liegen aber bereit in: ${TARGET_DIR}`);
        console.log(`[!] Du kannst diesen Ordner nun manuell per Rechtsklick "Zu ZIP archivieren".`);
    }
}

start();
