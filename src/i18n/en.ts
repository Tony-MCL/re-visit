export const en = {
  app: {
    title: "Re:visit?",
    subtitle: "One moment. One truth.",
    tabs: { capture: "Capture", log: "Log" },
    menu: { title: "Menu" },
    profiles: { private: "Private", work: "Work" },
  },

  categories: {
    restaurant: "Restaurant",
    cafe: "Café",
    hotel: "Hotel",
    travel: "Travel",
    experience: "Experience",
    activity: "Activity",
    other: "Other",
  },

  capture: {
    takePhoto: "Take photo",
    retakePhoto: "Retake photo",

    statusTaking: "Taking photo…",
    statusOptimizing: "Optimizing…",
    statusSaving: "Saving…",

    startingCamera: "Starting camera…",
    startingCameraHint: "(Mobile web can be slower here)",

    ratingQ: "Did I like this?",
    selected: "Selected:",
    rating: { yes: "Yes", neutral: "Neutral", no: "No" },

    categoryLabel: "Category",
    categoryHint: "Pick one category (you can filter in the log later).",

    commentLabel: "Optional comment (1–2 lines)",
    commentPlaceholder: "Write short...",

    save: "Save moment",
    saveHint: "Time is always saved. We ask for GPS only when saving.",

    savedTitle: "Saved",
    savedMsg: "Your moment has been saved to your log.",

    errTitle: "Error",
    errTakePhoto: "Could not take photo. Please try again.",
    errSave: "Could not save the moment.",

    cameraTitle: "Camera",
    cameraPerm: "Camera permission is required to take a photo.",
    enableCamera: "Enable camera",

    // NEW: limits/paywall
    limitWarnTitle: "Heads up",
    limitWarnMsg:
      "You’re nearing the free limit. When you reach {{max}}, you’ll need Pro to save more.",
    limitHardTitle: "Limit reached",
    limitHardMsg:
      "You’ve reached the free limit ({{max}} entries). Upgrade to save more.",
    lockedProfileTitle: "Work profile is Pro",
    lockedProfileMsg:
      "The Work profile is available in Pro. Upgrade to use multiple profiles.",
    maybeLater: "Later",
    learnMore: "See Pro",
  },

  log: {
    title: "Log",
    loading: "Loading…",
    entries: "entries",

    emptyTitle: "No entries yet",
    emptyMsg: "Go to “Capture”, take a photo, and save your first moment.",

    noGps: "(No GPS)",
    rating: { yes: "🙂 Yes", neutral: "😐 Neutral", no: "🙁 No" },

    edit: "Edit",
    done: "Done",
    delete: "Delete",

    deleteDialogTitle: "Delete entry",
    deleteDialogMsg: "This deletes the entry from this device. This cannot be undone.",
    cancel: "Cancel",
    confirmDelete: "Delete",

    filter: "Filter",
    filterTitle: "Filter log",
    showAll: "Show all",
    apply: "Apply",
    clearFilter: "Reset",
    category: "Category",

    // NEW: work profile locked message
    lockedTitle: "Work profile is Pro",
    lockedMsg: "Upgrade to Pro to use multiple profiles.",
  },

  paywall: {
    primary: "See Pro",
    secondary: "Later",
  },

  language: {
    label: "Language",
    no: "NO",
    en: "EN",
  },

  dev: {
  title: "Developer",
  plan: "Plan",
  setFree: "Set Free",
  setPro: "Set Pro",
},

} as const;
