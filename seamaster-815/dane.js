// ============================================================
//  DANE JACHTU – edytuj ten plik, aby dopasować aplikację
//  do swojego egzemplarza (nazwa, port, silnik, wyposażenie…)
// ============================================================
const JACHT = {
  nazwa: "Tatulator",
  rejestracja: "PL00016R",         // ← sprawdź z dokumentami
  typ: "Seamaster 815",
  portMacierzysty: "uzupełnij",     // np. "Gdynia, Marina Yacht Park"
  rokBudowy: "uzupełnij",           // np. 1978
  bandera: "PL",
  opis:
    "Klasyczny, dzielny jacht rodzinny zaprojektowany przez biuro Holman & Pye. " +
    "Słynie z bardzo dobrych właściwości żeglarskich i zaskakująco wygodnego " +
    "jak na swoją długość wnętrza.",

  // Dane klasy – źródła: nautinst.org, listingsport.com, ogłoszenia boats.com
  specyfikacja: [
    { etykieta: "Długość całkowita (LOA)", wartosc: "8,15 m", ikona: "↔" },
    { etykieta: "Długość linii wodnej (LWL)", wartosc: "ok. 6,39 m", ikona: "≈" },
    { etykieta: "Szerokość", wartosc: "ok. 2,70 m", ikona: "⇕" },
    { etykieta: "Zanurzenie", wartosc: "ok. 1,37 m", ikona: "⬇" },
    { etykieta: "Wyporność", wartosc: "ok. 3 200 kg", ikona: "⚖" },
    { etykieta: "Ożaglowanie", wartosc: "slup", ikona: "⛵" },
    { etykieta: "Kil", wartosc: "płetwowy", ikona: "▼" },
    { etykieta: "Kadłub", wartosc: "laminat (GRP)", ikona: "◆" },
    { etykieta: "Silnik", wartosc: "zaburtowy", ikona: "⚙" },
    { etykieta: "Koje", wartosc: "uzupełnij", ikona: "☾" },
  ],

  historia: [
    { rok: "1975", tekst: "Projekt jachtu powstaje w biurze Holman & Pye." },
    { rok: "1976", tekst: "Start produkcji seryjnej Seamaster 815." },
    { rok: "1981", tekst: "Koniec produkcji – powstało ok. 136 egzemplarzy." },
    { rok: "17.10.2026", tekst: "Transport lądem na przyczepie: Stepnica → Budzień." },
    { rok: "dziś", tekst: "Jako „Tatulator” pływa pod polską banderą. ⚓" },
  ],

  wyposazenie: [
    "Genua na rolerze (z pasem UV)",
    "Grot w lazy bagu",
    "Buda (sprayhood)",
    "Pokład z okładziną typu teak",
    "Silnik zaburtowy",
    "Pulpit dziobowy, kosz rufowy i relingi",
    "Luk dziobowy",
    "Antena i wiatrowskaz na topie masztu",
    "Koło ratunkowe",
    "Ploter nawigacyjny",
    "Echosonda i wyświetlacze przyrządów",
    "Kompas w kokpicie",
    "Panel silnika w kokpicie",
    "Kabestany (winsze) na zrębnicach",
    "Drewniane wykończenie kokpitu i siedziska",
    "Grot Apollo Sails",
    "Ster zawieszany na pawęży z drewnianym rumplem",
    "Platforma rufowa z okładziną typu teak",
    "Bandera PL na rufie",
  ],

  // Opisy punktów na interaktywnej wizualizacji
  elementy: {
    maszt: "Maszt z jednym piętrem salingów, na topie antena i wiatrowskaz.",
    genua: "Genua zwinięta na rolerze sztagu – niebieski pas chroni żagiel przed słońcem.",
    lazybag: "Grot złożony w niebieskim lazy bagu na bomie.",
    buda: "Niebieska buda (sprayhood) z przezroczystym oknem chroni zejściówkę i kokpit.",
    poklad: "Pokład z brązową okładziną typu teak na dziobie i przy nadbudówce.",
    kadlub: "Biały kadłub z laminatu z podwójnym brązowym pasem wzdłuż burty.",
    rufa: "Rufa: kosz rufowy, koło ratunkowe, bandera i silnik zaburtowy. Na pawęży róża wiatrów i numer rejestracyjny.",
    ster: "Ster zawieszany na pawęży – płetwa sterowa schodzi pod wodę za rufą.",
    kil: "Kil płetwowy – zanurzenie ok. 1,37 m.",
  },

  // Zdjęcia: wrzuć pliki do folderu "zdjecia/" i dopisz je tutaj.
  // Zdjęcia możesz też dodawać bezpośrednio w aplikacji (zapisują się w przeglądarce).
  zdjecia: [
    { plik: "zdjecia/tatulator-burta.jpg", podpis: "Tatulator przy kei w słońcu" },
    { plik: "zdjecia/szczecin-mcn.jpg", podpis: "Szczecin – przy Morskim Centrum Nauki" },
    { plik: "zdjecia/marina-poklad.jpg", podpis: "W marinie – widok na pokład" },
    { plik: "zdjecia/w-boksie.jpg", podpis: "W boksie obok Skorpiosa" },
    { plik: "zdjecia/pod-zaglami.jpg", podpis: "Pod żaglami – widok z kokpitu" },
    { plik: "zdjecia/marina-z-gory.jpg", podpis: "Z lotu ptaka w marinie – 26 lipca" },
    { plik: "zdjecia/transport.jpg", podpis: "Transport: Stepnica → Budzień, 17 października" },
  ],
};
