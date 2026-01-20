// Configuration for the sleep questionnaire wizard
// Each step represents one screen in the wizard

export const sleepFormSteps = [
  {
    stepId: "before_sleep",
    title: "Before Sleep",
    questions: [
      {
        id: "bed_entry_window",
        type: "single",
        label: "When did you get into bed?",
        options: [
          { value: "before_21", label: "Before 21:00" },
          { value: "21_to_midnight", label: "21:00 – Midnight" },
          { value: "after_midnight", label: "After Midnight" },
        ],
      },
      {
        id: "pre_sleep_activity",
        type: "multi",
        label: "What were you doing before falling asleep?",
        options: [
          { value: "phone", label: "Phone" },
          { value: "computer", label: "Computer" },
          { value: "music", label: "Music" },
          { value: "book", label: "Book" },
        ],
      },
    ],
  },
  {
    stepId: "sleep_quality",
    title: "Sleep Quality",
    questions: [
      {
        id: "time_to_fall_asleep",
        type: "single",
        label: "How long did it take you to fall asleep?",
        options: [
          { value: "immediate", label: "Immediately" },
          { value: "up_to_60", label: "Up to 1 hour" },
          { value: "up_to_120", label: "Up to 2 hours" },
          { value: "more_than_180", label: "3 hours or more" },
        ],
      },
    ],
  },
];
