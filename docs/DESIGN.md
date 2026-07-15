# Spiżarnia — specyfikacja UX/UI (dla Claude Design)

Wersja: 1.0 · Data: 2026-07-15 · Dokument bliźniaczy: `SPEC.md` (architektura i API)

Ten dokument jest samowystarczalną specyfikacją do zaprojektowania panelu **Spiżarnia**
dla Home Assistant. Deliverables designu: patrz §13.

---

## 1. Produkt w jednym akapicie

Panel w sidebarze Home Assistant do zarządzania domowymi zapasami. Struktura:
**pomieszczenia → półki → partie produktów** (partia = konkretne słoiki/opakowania
z własną ilością, datą ważności i datą produkcji). Główne operacje: **dodaj**
(najlepiej skanem kodu kamerą telefonu), **wydaj** (zdejmij ze stanu), **przejrzyj**
(co się przeterminuje, czego brakuje). System podpowiada zużywanie najstarszych
partii (FEFO — first expired, first out) i alarmuje o przeterminowaniach przez
automatyzacje HA.

## 2. Persony i konteksty użycia

**P1 — Robiący przetwory.** Jesienią wstawia 30 słoików w jednej sesji. Potrzebuje:
błyskawicznego dodawania seryjnego, dat z precyzją „rok" (na słoiku pisze się „2026"),
jednostki „słoik".

**P2 — Domownik gotujący.** Stoi w kuchni, chce wiedzieć „czy mamy jeszcze passatę
i gdzie". Potrzebuje: globalnej wyszukiwarki z lokalizacją („Piwnica / Regał A"),
szybkiego wydania jednym kciukiem.

**P3 — Zarządzający zapasami.** Raz w tygodniu przegląda co się kończy, planuje zakupy.
Potrzebuje: dashboardu statusów, listy niskich stanów, historii.

**Konteksty krytyczne:** telefon trzymany jedną ręką w spiżarni/piwnicy (często słabe
światło — skaner musi mieć latarkę); druga ręka zajęta słoikiem. **Mobile-first,
kciuk-first.** Desktop (tablet na ścianie, przeglądarka) — layout wielokolumnowy,
ale żadna funkcja nie może wymagać desktopu.

## 3. Zasady projektowe

1. **Wyglądaj jak Home Assistant.** Wyłącznie design tokens HA (tabela niżej). Panel ma
   sprawiać wrażenie natywnej części HA — w każdym motywie usera (dark/light/custom).
2. **Kciuk-first.** Touch targets ≥ 48 px; kluczowe akcje w dolnej strefie ekranu;
   bottom sheets zamiast centrowanych modali na mobile.
3. **Maks 3 kroki do dodania partii** od wejścia w panel (FAB → skan/wybór → zapis).
4. **Emoji jako język produktów.** Duża, natychmiast rozpoznawalna reprezentacja
   (🥒 vs 🍓 widać z metra). Zdjęcie (z Open Food Facts) zastępuje emoji, gdy jest.
5. **Data ważności = kolor.** Jeden spójny system statusów świeżości w całej aplikacji (§5).
6. **Anti-waste by default.** Przy wydawaniu zawsze proponuj najstarszą partię; ostrzeż
   (nie blokuj), gdy user bierze świeższą, a starsza istnieje.
7. **Undo zamiast potwierdzeń.** Operacje odwracalne (wydanie, dodanie) wykonują się
   natychmiast + toast z „Cofnij" (5 s). Potwierdzenie tylko dla kaskadowego usuwania
   (pomieszczenie/półka z zawartością) — z podaniem liczby traconych partii.
8. **Puste stany uczą.** Każdy pusty widok mówi, co zrobić, i ma przycisk tej akcji.
9. **Szybkość postrzegana.** Optimistic UI przy mutacjach; skeleton przy pierwszym
   ładowaniu; zero spinnerów pełnoekranowych po pierwszym renderze.
10. **Dwujęzyczność od pierwszego ekranu.** Wszystkie stringi przez i18n (pl/en);
    daty przez locale HA; polskie liczby mnogie (1 partia / 2 partie / 5 partii).

### Design tokens HA (obowiązkowe)

| token | rola |
|---|---|
| `--primary-color` | akcent: FAB, aktywne taby, linki, focus |
| `--primary-text-color`, `--secondary-text-color` | tekst |
| `--card-background-color` | tło kart |
| `--primary-background-color`, `--secondary-background-color` | tło widoku / sekcji |
| `--divider-color` | separatory, obrysy |
| `--error-color` | status „przeterminowane", destrukcje |
| `--warning-color` | status „kończy się termin" |
| `--success-color` | status „OK", potwierdzenia |
| `--info-color` | neutralne informacje |
| `--ha-card-border-radius` (fallback 12px) | zaokrąglenia kart |
| `--mdc-icon-size` | ikony MDI |
| Typografia: dziedzicz z HA (Roboto/system); skala: 22/18/16/14/12 | — |

Kolory kategorii (jedyne własne kolory — subtelny tint tła kafelka, 10 % opacity,
zdefiniowane parami light/dark): przetwory słodkie — róż, wytrawne — zieleń,
kompoty — brzoskwinia, miody — bursztyn, konserwy — stal, sypkie — piasek,
przyprawy — terakota, oleje — oliwka, napoje — błękit, słodycze — fiolet,
mrożonki — lód, gospodarcze — szarość, inne — neutralny.

## 4. Architektura informacji i nawigacja

```
Spiżarnia (panel)
├── Przegląd (dashboard)           /spizarnia
├── Pomieszczenie                  /spizarnia/room/<id>
│   └── Półka                      /spizarnia/shelf/<id>
├── Skaner / Dodawanie             /spizarnia/scan, /spizarnia/add
├── Katalog produktów              /spizarnia/catalog, /spizarnia/catalog/<id>
├── Szukaj                         /spizarnia/search
├── Historia                       /spizarnia/history
└── Ustawienia                     /spizarnia/settings
```

**Mobile (narrow=true):** bottom navigation, 5 slotów:
`[Przegląd] [Pomieszczenia] [ ⊕ FAB ] [Szukaj] [Więcej]`
- FAB (wyróżniony, uniesiony, `--primary-color`): otwiera arkusz „Dodaj": **Skanuj kod**
  (primary) / Z katalogu / Nowy produkt / Wydaj skanem.
- „Więcej": Katalog, Historia, Ustawienia.
- Nagłówek widoku: tytuł + strzałka wstecz (w podwidokach) + akcje kontekstowe.

**Desktop (narrow=false):** stały górny pasek z tabami (Przegląd · Pomieszczenia ·
Katalog · Historia · Ustawienia) + trwałe pole wyszukiwania + przycisk „⊕ Dodaj".
Treść: max-width 1200 px, wycentrowana; grid 2–4 kolumny wg szerokości.

## 5. System statusów świeżości (globalny)

| status | warunek | kolor | badge |
|---|---|---|---|
| `expired` | po dacie ważności | `--error-color` | „Przeterminowane" / „‑3 dni" |
| `expiring_soon` | ≤ N dni do daty (N z ustawień, domyślnie 30) | `--warning-color` | „12 dni" |
| `ok` | > N dni | `--success-color` | „06.2027" |
| `no_date` | bezterminowe | `--secondary-text-color` | „∞" (dyskretnie) |

Badge daty: pigułka z tłem koloru statusu (12 % opacity) i tekstem w pełnym kolorze.
Format daty wg precyzji: pełna `30.06.2027`, miesięczna `06.2027`, roczna `2027`.
Wszędzie, gdzie pojawia się partia (kafelek, lista, wyszukiwarka, sensor) — ten sam badge.

Priorytet sortowania domyślnego list partii: expired → expiring_soon (rosnąco po dacie)
→ ok (rosnąco) → no_date.

## 6. Widoki

### 6.1 Przegląd (dashboard) — ekran startowy

Kolejność sekcji (mobile, jednokolumnowo; desktop: 2 kolumny — statusy+aktywność | pomieszczenia):

1. **Pasek alertów** — do 3 kart-statusów, renderowane tylko gdy > 0:
   - czerwona: „🔴 3 przeterminowane" → tap: lista filtrowana
   - pomarańczowa: „🟠 7 kończy się termin (≤ 30 dni)" → tap: lista
   - szara/niebieska: „🛒 2 niskie stany" → tap: lista
   Gdy wszystko OK: jedna zielona karta „✅ Wszystko świeże" (buduje zaufanie).
2. **Szybkie akcje** — rząd 3 dużych przycisków: `📷 Skanuj` · `➕ Dodaj` · `➖ Wydaj`.
3. **Pomieszczenia** — grid kafelków 2 kol. (mobile) / 3–4 (desktop):
   ikona MDI, nazwa, „42 partie · 3 półki", mini-kropki statusów (czerwona/pomarańczowa
   z liczbą, jeśli > 0). Tap → widok pomieszczenia. Ostatni kafelek: „+ Nowe pomieszczenie" (ghost).
4. **Ostatnia aktywność** — 5 wierszy historii (ikona operacji, „Dodano 5× Ogórki kiszone",
   względny czas, kto), link „Cała historia →".

Stany: pierwsze uruchomienie → onboarding (§7.4). Skeleton: karty-duchy 3 sekcji.

### 6.2 Pomieszczenie

- Nagłówek: ikona + nazwa (tap na nazwę → edycja inline), menu ⋮ (zmień ikonę, zmień
  kolejność półek, usuń pomieszczenie).
- Lista **półek** jako karty pełnej szerokości, każda:
  - nazwa + licznik partii + kropki statusów,
  - **pasek podglądu**: do 8 emoji/miniatur produktów z półki + „+12",
  - tap → widok półki.
- Reorder półek: tryb z uchwytami ≡ (drag) po wybraniu z menu; na mobile także
  strzałki ↑↓.
- FAB kontekstowy: „➕ Dodaj tutaj" (preselekcja pomieszczenia w flow dodawania).
- Pusta lista półek → empty state: „Dodaj pierwszą półkę" + szybkie propozycje
  chipów: „Górna", „Środkowa", „Dolna", „Regał A".

### 6.3 Półka — serce aplikacji

- Nagłówek: breadcrumb „Piwnica / Regał A", licznik, menu ⋮ (edytuj, przenieś się do
  reorder, usuń).
- Pasek narzędzi: sortowanie (data ważności ▾ / nazwa / ilość / dodano) + chipy filtrów
  kategorii (przewijane poziomo) + toggle grupowania.
- **Grid kafelków partii** (2 kol. mobile / 4–5 desktop). Kafelek (spz-product-tile):
  - tło: `--card-background-color` + tint kategorii 10 %,
  - emoji 44 px **lub** zdjęcie (kwadrat, zaokrąglony),
  - nazwa (2 linie max, ellipsis),
  - ilość + jednostka, wyraźne („5 słoików"),
  - badge daty (system §5) w rogu,
  - wskaźnik „otwarte": mała ikona 🥄/„otwarty" przy ilości,
  - long-press / hover: szybkie „➖ 1" (natychmiastowe wydanie 1 szt. z undo-toastem).
- **Grupowanie partii** (domyślnie ON): partie tego samego produktu → jeden kafelek
  z sumą („8 słoików · 3 partie") i badge NAJSTARSZEJ daty; tap → bottom sheet z listą
  partii (posortowaną FEFO) zamiast szczegółów pojedynczej partii.
- Tap kafelka (pojedyncza partia) → **bottom sheet szczegółów partii**:
  - nagłówek: emoji/zdjęcie + nazwa + lokalizacja,
  - dane: ilość, data ważności (badge), data produkcji, dodano (kiedy, kto), notatka,
  - akcje-przyciski: **Wydaj** (otwiera stepper ilości z dużymi ±, potwierdzenie
    głównym przyciskiem), **Otwórz/Zamknij** (toggle `opened`), **Przenieś**
    (picker pomieszczenie→półka), **Edytuj**, **Usuń** (destructive, na końcu).
- Pusta półka → empty state „Postaw tu pierwszy produkt" + przycisk „Skanuj" i „Z katalogu".

### 6.4 Skaner (fullscreen)

- Pełnoekranowy podgląd kamery; przyciemnienie poza centralną ramką celowania
  (prostokąt ~70 % szerokości, proporcje 3:2 dla EAN).
- Górny pasek: ✕ zamknij · 🔦 latarka (toggle; ukryj, gdy nieobsługiwana).
- Dolny slot: pole „wpisz kod ręcznie" (inputmode=numeric) — zawsze widoczne;
  obsługuje też skaner USB/BT.
- Po detekcji: wibracja + zielony flash ramki + przejście wg wyniku:
  - **kod znany lokalnie** → od razu formularz partii (§7.1 krok 3) z wypełnionym produktem,
  - **znaleziony w OFF** → karta potwierdzenia: zdjęcie, nazwa, marka, gramatura,
    sugerowana kategoria (edytowalne) + „Dodaj do katalogu i kontynuuj",
  - **nieznany** → formularz nowego produktu z przypisanym kodem („Nie znamy tego kodu —
    stwórz produkt").
- **Tryb seryjny** (toggle w skanerze, domyślnie ON przy wejściu z FAB): po zapisaniu
  partii wraca do kamery; licznik sesji „Dodano: 4" + lista zwijana; ten sam kod
  w ciągu 3 s ignorowany.
- Stany błędów: brak zgody na kamerę / brak HTTPS → pełny ekran wyjaśnienia z
  instrukcją i dużym polem ręcznego wpisu (funkcja nie może być ślepym zaułkiem).

### 6.5 Katalog produktów

- Search (sticky) + taby/chipy kategorii + sortowanie (nazwa / ostatnio używane).
- Lista wierszy: emoji/zdjęcie, nazwa, kategoria, suma stanu („12 słoików w 2 miejscach"),
  ikona 🏷️ gdy ma przypisane kody. Tap → **karta produktu**:
  - edycja: nazwa, emoji (picker z sugestiami per kategoria), zdjęcie (z OFF / usuń),
    kategoria, domyślna jednostka, typowy termin przydatności (dni), próg minimalnego
    stanu, notatki,
  - kody kreskowe: lista + „➕ dodaj skanem" (mini-skaner) + wpis ręczny,
  - sekcja „Stany": partie tego produktu pogrupowane po lokalizacji (link do półek),
  - akcje: „➕ Dodaj partię" (preselekcja produktu), „Usuń produkt" (zablokowane
    z wyjaśnieniem, gdy istnieją partie).
- „➕ Nowy produkt" — przycisk stały w nagłówku.

### 6.6 Szukaj (globalne)

- Autofocus w pole; wyniki od 2 znaków, na żywo; ostatnie wyszukiwania.
- Wyniki zunifikowane, grupy: **Produkty w spiżarni** (partie: kafelek-wiersz z ilością,
  badge daty i ŚCIEŻKĄ lokalizacji „Piwnica / Regał A" — to jest odpowiedź na „gdzie
  jest passata"), **Katalog** (definicje bez stanu — z przyciskiem „dodaj partię"),
  **Akcje** („Utwórz produkt ‚«query»'").
- Wiersz wyniku partii: swipe/przycisk „➖ Wydaj" bez wchodzenia głębiej.

### 6.7 Historia

- Timeline grupowany nagłówkami dni („Dziś", „Wczoraj", „12 lipca").
- Wiersz: ikona typu operacji (➕ zielona / ➖ pomarańczowa / ↔️ / ✏️ / 🗑️),
  treść „Kamil wydał 2× Passata pomidorowa", lokalizacja, godzina.
- Filtry: typ operacji (chipy), produkt, pomieszczenie, osoba.
- Paginacja: infinite scroll po 50.

### 6.8 Ustawienia

Sekcje-karty: **Alerty** (próg dni „kończy się termin" — slider 1–365 z podglądem
skutku: „obecnie 7 partii łapie się w próg"), **Open Food Facts** (toggle + locale),
**Pomieszczenia i półki** (zarządzanie + reorder), **Dane** (eksport JSON, liczba
rekordów, informacja o backupie HA), **O integracji** (wersja, link GitHub, licencja).

## 7. Kluczowe flow (krok po kroku)

### 7.1 Dodanie partii skanem — happy path ≤ 20 s

1. FAB ⊕ → arkusz → **Skanuj kod** (albo bezpośrednio, gdy wejście z „Dodaj tutaj" na półce).
2. Skan → kod znaleziony lokalnie (produkt: „Passata pomidorowa 🍅").
3. **Formularz partii** (bottom sheet, jedna strona, bez scrolla na typowym telefonie):
   - produkt (nagłówek z emoji — tap zmienia),
   - **ilość**: stepper z dużymi ± i polem (default 1; jednostka chipem obok, default
     produktu),
   - **data ważności**: rząd szybkich chipów: `Brak` `+3 mies.` `+6 mies.` `+1 rok`
     `+2 lata` `Koniec roku` `📅 wybierz` — chip ustawia datę i precyzję; wybrana data
     wyświetlona dużym tekstem z możliwością tapnięcia (kalendarz). Gdy produkt ma
     „typowy termin" — prewybrany odpowiedni chip (badge „sugerowane"),
   - **półka**: ostatnio używana jako default; tap → dwustopniowy picker
     (pomieszczenie → półka) z zapamiętaniem,
   - zwinięte „Więcej": data produkcji, notatka, otwarte,
   - CTA: **[ Dodaj ]** + drugi przycisk **[ Dodaj i skanuj następny ]** (tryb seryjny).
4. Toast: „✅ Dodano: Passata pomidorowa ×2 → Piwnica / Regał A · **Cofnij**".

### 7.2 Wydanie — z półki i skanem

**Z półki:** kafelek → sheet → „Wydaj" → stepper (default 1) → [Wydaj] → toast z undo.
Skrót: long-press kafelka = „➖ 1" natychmiast.

**Skanem (gotowanie):** FAB → „Wydaj skanem" → skan → produkt ma 3 partie →
sheet „Wydaj: Passata": **partia FEFO wybrana automatycznie** (najstarsza, oznaczona
„najstarsza ✓" + jeśli `opened` — „otwarta ✓"), lista pozostałych partii wybieralna →
stepper → [Wydaj]. Gdy user wybierze świeższą, a starsza istnieje: żółty pasek
„Masz starszą partię (05.2026) — na pewno ta?" (nie blokuje).
Gdy wydanie > stan partii: automatycznie schodzi z kolejnych partii FEFO,
podsumowanie w potwierdzeniu („2 z partii A, 1 z partii B").

### 7.3 Przeterminowane — sprzątanie

Dashboard → czerwona karta → lista przeterminowanych (wiersze z badge i lokalizacją) →
na wierszu akcje: „Wyrzuć" (delete z powodem `expired`, historia to odnotuje) /
„Jednak dobre" (przedłuż datę — otwiera picker). Akcja masowa: „Wyrzuć wszystkie" z
potwierdzeniem liczbowym.

### 7.4 Onboarding (pierwsze uruchomienie)

Trzy kroki w jednym przepływie, każdy pomijany:
1. „Nazwij swoje miejsca" — chipy szybkiego startu: `Spiżarnia` `Piwnica` `Garaż`
   `Kuchnia` (multi-select) → tworzy pomieszczenia, każde z półką „Półka 1".
2. „Jak liczyć ‚kończy się termin'?" — slider dni (default 30).
3. „Dodaj pierwszy produkt" — dwa duże przyciski: `📷 Skanuj` / `Z katalogu`.
Po zamknięciu: normalny dashboard (empty states poprowadzą dalej).

## 8. Reprezentacja produktów

- **Hierarchia wizualna:** zdjęcie (jeśli jest, z OFF) > emoji produktu > emoji
  kategorii (fallback). Nigdy pusty kwadrat.
- Emoji picker przy edycji: sekcja „sugerowane dla kategorii" (np. dla przetworów
  wytrawnych: 🥒🫑🍄🧅🌶️🥬🫙) + pełny wybór + wyszukiwarka emoji.
- Zdjęcia: kwadrat 1:1, `object-fit: cover`, zaokrąglenie 8 px, rozmiar kafelka.
- Tint kategorii na kafelku pomaga skanować półkę wzrokiem („szukam czegoś różowego
  = słodkie przetwory").

## 9. Biblioteka komponentów (custom elements `spz-*`)

| komponent | opis / kluczowe stany |
|---|---|
| `spz-product-tile` | kafelek partii/grupy: emoji/zdjęcie, nazwa, ilość, badge, tint kategorii; wariant compact (listy) |
| `spz-freshness-badge` | pigułka statusu §5; props: date, precision, status |
| `spz-qty-stepper` | duże ± (48 px), pole edytowalne, wsparcie float, min/max |
| `spz-date-quick-pick` | chipy relatywne + kalendarz + precyzja (dzień/miesiąc/rok/brak) |
| `spz-location-picker` | dwustopniowy wybór pomieszczenie→półka, ostatnio używane na górze |
| `spz-bottom-sheet` | arkusz mobile / dialog centr. desktop; drag-to-dismiss |
| `spz-toast` | toast z akcją Undo, kolejka, 5 s |
| `spz-scanner` | overlay kamery: ramka, latarka, ręczny input, tryb seryjny |
| `spz-empty-state` | ilustracja-emoji, nagłówek, opis, 1–2 CTA |
| `spz-search-bar` | pole z debounce 250 ms, clear, autofocus opcjonalny |
| `spz-category-chips` | przewijane chipy kategorii z emoji, multi/single select |
| `spz-stat-card` | karta alertu dashboardu: kolor statusu, liczba, etykieta, chevron |
| `spz-room-card` / `spz-shelf-card` | kafelek pomieszczenia / karta półki z paskiem podglądu |
| `spz-history-row` | wiersz timeline z ikoną typu |
| `spz-confirm-dialog` | tylko dla destrukcji kaskadowych; wymaga liczby („Usuniesz 12 partii") |

## 10. Mikrointerakcje i animacje

- Czas trwania 150–250 ms, easing standard; `prefers-reduced-motion` → wyłącz wszystkie poza opacity.
- Bottom sheet: slide-up + fade scrim; drag-to-dismiss z progiem.
- Zmiana ilości: liczba „tyka" (krótki scale bump).
- Wydanie partii do zera: kafelek fade+collapse (po zamknięciu okna undo).
- Skan sukces: flash ramki na `--success-color` + wibracja 50 ms.
- Reorder: uniesienie karty (shadow), placeholder.
- Optimistic UI: mutacja od razu w widoku; przy błędzie — rollback + toast błędu.

## 11. Dostępność

- Kontrasty ≥ WCAG AA w obu motywach (statusy: tekst pełnym kolorem na tincie 12 % —
  sprawdzić na dark).
- Status NIGDY tylko kolorem: badge zawsze z tekstem (data/dni), ikony przy alertach.
- Pełna obsługa klawiatury na desktop (tab-order, Escape zamyka sheet, Enter zatwierdza).
- `aria-label` na akcjach ikonowych; live region dla toastów.
- Emoji dekoracyjne z `aria-hidden`; nazwa produktu zawsze tekstem.
- Rozmiar tekstu respektuje ustawienia przeglądarki (rem, nie px, dla typografii).

## 12. Ton i copy

- Po polsku: bezosobowo lub 2. os. l.poj. („Dodaj pierwszy produkt"), zwięźle, bez
  wykrzykników poza sukcesami. Liczby mnogie poprawne (1 partia / 2 partie / 5 partii).
- Daty względne w historii („2 godz. temu"), bezwzględne przy danych partii.
- Błędy: co się stało + co zrobić („Nie udało się sprawdzić kodu w Open Food Facts.
  Dodaj produkt ręcznie lub spróbuj później.").

## 13. Deliverables Claude Design

Kolejność prac; każdy mockup jako samodzielny HTML (jeden plik, inline CSS) stylowany
**zmiennymi z fallbackami** (`var(--card-background-color, #1c1c1c)`), w dwóch
wariantach motywu (przełącznik w mockupie) i dwóch szerokościach (390 px / 1200 px):

1. **Design tokens sheet** — próbnik: statusy, tinty kategorii, badge, typografia, spacing.
2. **Dashboard** (stan pełny + stan „wszystko OK" + empty/onboarding).
3. **Półka** (grid, grupowanie partii, bottom sheet szczegółów, stepper wydania).
4. **Flow dodawania** — 3 ekrany: skaner, karta potwierdzenia OFF, formularz partii
   (z chipami dat) + toast undo.
5. **Flow wydawania skanem** — wybór partii FEFO z ostrzeżeniem anti-waste.
6. **Pomieszczenie + katalog + karta produktu.**
7. **Szukaj + historia + ustawienia.**
8. **Komponenty** — arkusz wszystkich `spz-*` we wszystkich stanach (default/hover/
   active/disabled/error/empty/loading-skeleton).
9. **Ikona integracji (brands)** — znak „Spiżarnia" (motyw: słoik / regał z weckami);
   musi być czytelny w 24 px na jasnym i ciemnym tle. Eksporty: `icon.png` 256×256
   i `icon@2x.png` 512×512, PNG z przezroczystym tłem, przycięte do treści (bez
   marginesów) — pod PR do `home-assistant/brands`; do tego poziomy `logo.png`
   na nagłówek README oraz social preview repo (1280×640).

Kryteria akceptacji mockupów: działa w dark i light bez zmian w kodzie poza tokenami;
touch targets ≥ 48 px; widoczna hierarchia F-pattern; realistyczne polskie dane
przykładowe (dżem truskawkowy 2026, ogórki kiszone ×8, przecier pomidorowy...).
