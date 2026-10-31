// ============================================================
//  DANE JACHTU – edytuj ten plik, aby dopasować aplikację
//  do swojego egzemplarza (nazwa, port, silnik, wyposażenie…)
// ============================================================
const JACHT = {
  nazwa: "Seamaster 815",          // ← wpisz nazwę swojego jachtu
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
    { etykieta: "Silnik", wartosc: "uzupełnij", ikona: "⚙" },
    { etykieta: "Koje", wartosc: "uzupełnij", ikona: "☾" },
  ],

  historia: [
    { rok: "1975", tekst: "Projekt jachtu powstaje w biurze Holman & Pye." },
    { rok: "1976", tekst: "Start produkcji seryjnej Seamaster 815." },
    { rok: "1981", tekst: "Koniec produkcji – powstało ok. 136 egzemplarzy." },
    { rok: "dziś", tekst: "Jacht pływa pod moją banderą. ⚓" },
  ],

  wyposazenie: [
    "Grot i fok/genua",
    "Silnik stacjonarny",
    "Kompas",
    "Echosonda / log",
    "Radio VHF",
    "Kambuz z kuchenką",
    "Kotwica z łańcuchem",
    "Kamizelki i koło ratunkowe",
  ],

  // Zdjęcia: wrzuć pliki do folderu "zdjecia/" i dopisz je tutaj.
  // Zdjęcia możesz też dodawać bezpośrednio w aplikacji (zapisują się w przeglądarce).
  zdjecia: [
    // { plik: "zdjecia/jacht1.jpg", podpis: "Na żaglach" },
  ],
};
