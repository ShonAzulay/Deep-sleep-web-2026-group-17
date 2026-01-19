const TRANSLATIONS = {
    // Activities
    "Computer": "מחשב",
    "computer": "מחשב",
    "Phone": "נייד",
    "phone": "נייד",
    "Tablet": "טאבלט",
    "tablet": "טאבלט",
    "TV": "טלוויזיה",
    "tv": "טלוויזיה",
    "Reading": "קריאה/ספר",
    "reading": "קריאה/ספר",
    "Music": "מוזיקה",
    "music": "מוזיקה",
    "Sport": "ספורט",
    "sport": "ספורט",
    "Shower": "מקלחת",
    "shower": "מקלחת",
    "Gaming": "גיימינג",
    "gaming": "גיימינג",

    // Wake Methods
    "Natural": "טבעי",
    "natural": "טבעי",
    "Alarm": "שעון מעורר",
    "alarm": "שעון מעורר",
    "Parents": "הורים",
    "parents": "הורים",
    "Other": "אחר",
    "other": "אחר",
    "Others": "אחר",
    "others": "אחר",
    "Noise Light": "רעש / אור",
    "noise_light": "רעש / אור",

    // Ranges & Numeric Translations
    "Under 5": "פחות מ-5",
    "5 6": "5-6",
    "6 7": "6-7",
    "7 8": "7-8",
    "8 9": "8-9",
    "9 8": "8-9",
    "Over 9": "מעל 9",
    "15 30": "15-30",
    "30 60": "30-60",
    "5 15": "5-15",
    "Over 60": "מעל 60",
    "Or Less 15": "15 דקות או פחות",
    "or_less_15": "15 דקות או פחות",
    "15 or less": "15 דקות או פחות",

    // Activities & Other corrections
    "Book": "ספר",
    "book": "ספר",
};

/**
 * Translations Utility
 * --------------------
 * Central dictionary for converting English data keys to Hebrew display labels.
 * 
 * @param {string} label - The label to translate.
 * @returns {string} The Hebrew translation or the original key if missing.
 */
export function t(label) {
    if (!label) return "";
    const clean = label.toString().replace(/_/g, ' ').trim();
    const lower = clean.toLowerCase();

    if (TRANSLATIONS[clean]) return TRANSLATIONS[clean];
    if (TRANSLATIONS[lower]) return TRANSLATIONS[lower];

    // Try to find case insensitive match
    const found = Object.keys(TRANSLATIONS).find(k => k.toLowerCase() === lower);
    return found ? TRANSLATIONS[found] : clean;
}
