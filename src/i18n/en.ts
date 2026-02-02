export const en = {
  app: {
    title: "Re:visit?",
    subtitle: "One moment. One truth.",
    tabs: { capture: "Capture", log: "Log" },
    menu: { title: "Menu" },
    profiles: { private: "Private", work: "Work" },
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
  },

  log: {
    title: "Log",
    loading: "Loading…",
    entries: "entries",
    refresh: "Refresh",
    clear: "Clear",

    emptyTitle: "No entries yet",
    emptyMsg: "Go to “Capture”, take a photo, and save your first moment.",

    clearTitle: "Clear log",
    clearMsg: "This deletes all local entries for this profile.",
    cancel: "Cancel",
    deleteAll: "Delete all",

    noGps: "(No GPS)",
    rating: { yes: "🙂 Yes", neutral: "😐 Neutral", no: "🙁 No" },
  },

  language: {
    label: "Language",
    no: "NO",
    en: "EN",
  },
} as const;
