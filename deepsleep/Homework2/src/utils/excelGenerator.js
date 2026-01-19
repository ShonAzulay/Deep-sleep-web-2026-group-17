import * as XLSX from "xlsx";

/**
 * Generates and downloads an Excel report for a specific class.
 * @param {Array} data - The array of student entry objects.
 * @param {string} classId - The ID of the class (for filename).
 */
export const generateClassReportExcel = (data, classId) => {
    // 1. Create Anonymized Map (Student Real ID -> Sequential Number 1, 2, 3...)
    const uniqueStudentIds = [...new Set(data.map(r => r.studentId || r.id))].filter(Boolean).sort();
    const studentIdMap = {};
    uniqueStudentIds.forEach((id, index) => {
        studentIdMap[id] = index + 1; // 1-based index
    });

    // Transform data for better Excel headers
    const exportData = data.map(row => {
        const realId = row.studentId || row.id;
        const anonymousId = studentIdMap[realId] || "Anonymous";

        const newRow = {
            "User Code": anonymousId,
            "תאריך": row.date,

            // Static Fields from SleepForm
            "שכבה": row.grade,
            "מגדר": row.gender === 'male' ? 'בן' : (row.gender === 'female' ? 'בת' : row.gender),
            "זמן כניסה למיטה": row.bed_entry_time,
            "זמן החלטה לעצום עיניים": row.eye_close_decision,
            "פעילות לפני שינה": Array.isArray(row.pre_sleep_activity) ? row.pre_sleep_activity.join(", ") : row.pre_sleep_activity,
            "זמן עד הירדמות": row.time_to_fall_asleep,
            "מספר יקיצות": row.wakeups_count,
            "משך ערות בלילה": row.awake_duration_total,
            "זמן יקיצה": row.wake_up_time,
            "אופן יקיצה": row.wake_up_method,
            "שעות שינה מוערכות": row.total_sleep_estimate,
            "הערות": row.notes || ""
        };

        // Handle Dynamic Questions
        Object.keys(row).forEach(key => {
            if (key.startsWith("custom_") && !key.endsWith("_category") && !key.endsWith("_text")) {
                const category = row[`${key}_category`] || "כללי";
                const questionText = row[`${key}_text`] || "שאלה מותאמת";
                const header = `[${category}] ${questionText}`;
                newRow[header] = row[key];
            }
        });

        return newRow;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ClassData");
    XLSX.writeFile(wb, `Class_${classId}_Report.xlsx`);
};
