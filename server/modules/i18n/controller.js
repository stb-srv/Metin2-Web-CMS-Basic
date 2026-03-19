const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

// Store translations in server/data/translations
const TRANSLATIONS_DIR = path.join(__dirname, '../../data/translations');

// Ensure directory exists
if (!fs.existsSync(TRANSLATIONS_DIR)) {
    fs.mkdirSync(TRANSLATIONS_DIR, { recursive: true });
}

/**
 * Get translations for a specific language
 */
exports.getTranslations = (req, res) => {
    const { lang } = req.params;
    const filePath = path.join(TRANSLATIONS_DIR, `${lang}.json`);

    if (fs.existsSync(filePath)) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return res.json({ success: true, translations: JSON.parse(data) });
        } catch (err) {
            logger.error(`[I18n] Error reading ${lang}.json:`, err);
            return res.status(500).json({ success: false, message: 'Fehler beim Laden der Übersetzungen.' });
        }
    } else {
        // Return empty object if not found, but success true to avoid breaking frontend
        return res.json({ success: true, translations: {} });
    }
};

/**
 * Save translations for a specific language
 */
exports.saveTranslations = (req, res) => {
    const { lang } = req.params;
    const { translations } = req.body;
    const filePath = path.join(TRANSLATIONS_DIR, `${lang}.json`);

    try {
        fs.writeFileSync(filePath, JSON.stringify(translations, null, 4), 'utf8');
        return res.json({ success: true, message: 'Übersetzungen erfolgreich gespeichert.' });
    } catch (err) {
        logger.error(`[I18n] Error saving ${lang}.json:`, err);
        return res.status(500).json({ success: false, message: 'Fehler beim Speichern der Übersetzungen.' });
    }
};

/**
 * List available languages
 */
exports.getLanguages = (req, res) => {
    const files = fs.readdirSync(TRANSLATIONS_DIR);
    const languages = files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    
    // Default list if none exist yet
    const defaultList = ['de', 'en', 'it', 'es', 'pl', 'ro', 'tr', 'pt'];
    const result = Array.from(new Set([...languages, ...defaultList]));

    return res.json({ success: true, languages: result });
};
