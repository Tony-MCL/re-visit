export const no = {
  app: {
    title: "Re:visit?",
    subtitle: "Én opplevelse. Én sannhet.",
    tabs: { capture: "Fang", log: "Logg" },
  },

  capture: {
    takePhoto: "Ta bilde",
    retakePhoto: "Ta nytt bilde",
    startingCamera: "Starter kamera…",
    startingCameraHint: "(Mobil-web kan være tregere her)",
    ratingQ: "Likte jeg dette?",
    selected: "Valgt:",
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
    clearMsg: "Dette sletter alle lokale oppføringer på denne enheten.",
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
