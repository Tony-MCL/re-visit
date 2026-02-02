export const no = {
  app: {
    title: "Re:visit?",
    subtitle: "Én opplevelse. Én sannhet.",
    tabs: { capture: "Fang", log: "Logg" },
    menu: { title: "Meny" },
    profiles: { private: "Privat", work: "Jobb" },
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
  },

  log: {
    title: "Logg",
    loading: "Laster…",
    entries: "oppføringer",
    refresh: "Oppdater",
    clear: "Tøm",

    emptyTitle: "Ingen oppføringer ennå",
    emptyMsg: "Gå til “Fang”, ta et bilde og lagre første øyeblikk.",

    clearTitle: "Tøm logg",
    clearMsg: "Dette sletter alle lokale oppføringer for denne profilen.",
    cancel: "Avbryt",
    deleteAll: "Slett alt",

    noGps: "(Ingen GPS)",
    rating: { yes: "🙂 Ja", neutral: "😐 Nøytral", no: "🙁 Nei" },
  },

  language: {
    label: "Språk",
    no: "NO",
    en: "EN",
  },
} as const;
