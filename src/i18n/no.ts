export const no = {
  app: {
    title: "Re:visit?",
    subtitle: "Én opplevelse. Én sannhet.",
    tabs: { capture: "Fang", log: "Logg" },
    menu: { title: "Meny" },
    profiles: { private: "Privat", work: "Jobb" },
  },

  categories: {
    restaurant: "Restaurant",
    cafe: "Kafé",
    hotel: "Hotell",
    travel: "Reise",
    experience: "Opplevelse",
    activity: "Aktivitet",
    other: "Annet",
  },

  capture: {
    takePhoto: "Ta bilde",
    retakePhoto: "Ta nytt bilde",

    statusTaking: "Tar bilde…",
    statusOptimizing: "Optimaliserer…",
    statusSaving: "Lagrer…",

    startingCamera: "Starter kamera…",
    startingCameraHint: "(Mobil-web kan være tregere her)",

    ratingQ: "Likte jeg dette?",
    selected: "Valgt:",
    rating: { yes: "Ja", neutral: "Nøytral", no: "Nei" },

    categoryLabel: "Kategori",
    categoryHint: "Velg én kategori (du kan filtrere i loggen senere).",

    commentLabel: "Valgfri kommentar (1–2 linjer)",
    commentPlaceholder: "Skriv kort...",

    save: "Lagre øyeblikk",
    saveHint: "Tid lagres alltid. GPS spør vi om først ved lagring.",

    savedTitle: "Lagret",
    savedMsg: "Opplevelsen er lagret i loggen din.",

    errTitle: "Feil",
    errTakePhoto: "Kunne ikke ta bilde. Prøv igjen.",
    errSave: "Kunne ikke lagre opplevelsen.",

    cameraTitle: "Kamera",
    cameraPerm: "Du må gi kameratilgang for å ta bilde.",

    // NEW: limits/paywall
    limitWarnTitle: "Heads up",
    limitWarnMsg:
      "Du nærmer deg grensen for gratisversjonen. Når du når {{max}}, må du oppgradere for å lagre flere.",
    limitHardTitle: "Grense nådd",
    limitHardMsg:
      "Du har nådd grensen for gratisversjonen ({{max}} oppføringer). Oppgrader for å lagre flere.",
    lockedProfileTitle: "Jobb-profil er Pro",
    lockedProfileMsg:
      "Jobb-profilen er tilgjengelig i Pro. Oppgrader for å bruke flere profiler.",
    maybeLater: "Senere",
    learnMore: "Se Pro",
  },

  log: {
    title: "Logg",
    loading: "Laster…",
    entries: "oppføringer",

    emptyTitle: "Ingen oppføringer ennå",
    emptyMsg: "Gå til “Fang”, ta et bilde og lagre første øyeblikk.",

    noGps: "(Ingen GPS)",
    rating: { yes: "🙂 Ja", neutral: "😐 Nøytral", no: "🙁 Nei" },

    edit: "Rediger",
    done: "Ferdig",
    delete: "Slett",

    deleteDialogTitle: "Slett innlegg",
    deleteDialogMsg: "Dette sletter innlegget fra denne enheten. Kan ikke angres.",
    cancel: "Avbryt",
    confirmDelete: "Slett",

    filter: "Filter",
    filterTitle: "Filtrer logg",
    showAll: "Vis alle",
    apply: "Bruk",
    clearFilter: "Nullstill",
    category: "Kategori",

    // NEW: work profile locked message
    lockedTitle: "Jobb-profil er Pro",
    lockedMsg: "Oppgrader til Pro for å bruke flere profiler.",
  },

  paywall: {
    primary: "Se Pro",
    secondary: "Senere",
  },

  language: {
    label: "Språk",
    no: "NO",
    en: "EN",
  },
} as const;
