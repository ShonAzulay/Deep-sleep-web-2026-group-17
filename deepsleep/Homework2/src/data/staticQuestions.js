export const STATIC_STEPS = [
    {
        key: "grade",
        title: "אני בכיתה",
        type: "select",
        options: [
            { value: "z", label: "ז" }, { value: "h", label: "ח" },
            { value: "t", label: "ט" }, { value: "y", label: "י" },
            { value: "ya", label: "י\"א" }, { value: "yb", label: "י\"ב" }
        ],
    },
    {
        key: "gender",
        title: "מגדר",
        type: "select",
        options: [{ value: "male", label: "בן" }, { value: "female", label: "בת" }],
    },
    {
        key: "bed_entry_time",
        title: "נכנסתי למיטה בין השעות",
        type: "select",
        options: [
            { value: "before_21", label: "לפני השעה 21:00" },
            { value: "21_24", label: "בין 21:00- לחצות" },
            { value: "after_24", label: "אחרי חצות" }
        ],
    },
    {
        key: "eye_close_decision",
        title: "הזמן בערך בו החלטתי לעצום עיניים אחרי שנכנסתי למיטה",
        type: "select",
        options: [
            { value: "immediate", label: "מיד כשנכנסתי למיטה לישון" },
            { value: "up_to_1h", label: "עד שעה אחת אחרי שנכנסתי" },
            { value: "2h", label: "שעתיים אחרי שנכנסתי" },
            { value: "3h_plus", label: "כ-3 שעות או יותר" }
        ],
    },
    {
        key: "pre_sleep_activity",
        title: "במה הייתי עסוק/ה לפני שנרדמתי",
        type: "multi",
        options: [
            { value: "phone", label: "טלפון" }, { value: "computer", label: "מחשב" },
            { value: "tablet", label: "טאבלט" }, { value: "book", label: "ספר" },
            { value: "music", label: "מוזיקה" }, { value: "other", label: "אחר" }
        ],
    },
    {
        key: "time_to_fall_asleep",
        title: "הזמן (בדקות) שלקח לי להירדם מהרגע שהחלטתי לעצום עיניים",
        type: "select",
        options: [
            { value: "under_5", label: "פחות מ-5 דקות" },
            { value: "15_or_less", label: "רבע שעה או פחות" },
            { value: "15_30", label: "בין רבע שעה לחצי שעה" },
            { value: "30_60", label: "בין חצי שעה לשעה" },
            { value: "over_60", label: "מעל שעה" }
        ],
    },
    {
        key: "wakeups_count",
        title: "מספר היקיצות שלך בלילה",
        type: "select",
        options: [0, 1, 2, 3, 4, 5, 6, 7, "8 ויותר"].map(v => ({ value: String(v), label: String(v) })),
    },
    {
        key: "awake_duration_total",
        title: "סך כל הדקות שבהן היית ער/ה מהיקיצות בלילה",
        type: "select",
        options: [
            { value: "under_5", label: "פחות מ-5 דקות" },
            { value: "5_15", label: "5 עד 15 דקות" },
            { value: "15_30", label: "15 עד 30 דקות" },
            { value: "30_60", label: "חצי שעה עד שעה" },
            { value: "over_60", label: "מעל שעה" }
        ],
    },
    {
        key: "wake_up_time",
        title: "בבוקר התעוררתי בין השעות",
        type: "select",
        options: [
            { value: "5_6", label: "5-6" }, { value: "6_7", label: "6-7" },
            { value: "7_8", label: "7-8" }, { value: "8_9", label: "8-9" },
            { value: "after_9", label: "אחרי 9 בבוקר" }
        ],
    },
    {
        key: "wake_up_method",
        title: "כיצד התעוררת?",
        type: "select",
        options: [
            { value: "alarm", label: "שעון מעורר" }, { value: "others", label: "העירו אותי" },
            { value: "natural", label: "לבד" }, { value: "noise_light", label: "רעש/אור" }
        ],
    },
    {
        key: "total_sleep_estimate",
        title: "כמה שעות להערתך ישנת אתמול בלילה",
        type: "select",
        options: [
            { value: "under_5", label: "פחות מ-5" }, { value: "5_6", label: "5-6" },
            { value: "6_7", label: "6-7" }, { value: "7_8", label: "7-8" },
            { value: "8_9", label: "8-9" }, { value: "over_9", label: "מעל 9" }
        ],
    },
    {
        key: "notes",
        title: "יש לך הערה שחשוב שנדע?",
        type: "text",
        optional: true,
        placeholder: "זו שאלת בחירה..."
    }
];
