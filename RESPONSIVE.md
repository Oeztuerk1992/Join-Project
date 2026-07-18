# Responsive-Umbau — Arbeitsplan (3 Personen)

Ziel: Das Join-Projekt vom reinen Desktop-Layout auf Mobile/Tablet umstellen,
nach der Figma-Mobile-Vorlage. Aktuell gibt es **null Media Queries** im Projekt.

Dieses Dokument ist die verbindliche Absprache. Wer was macht, was zu tun ist,
und wie wir uns nicht in die Quere kommen.

---

## 1. Verbindliche Breakpoints (gelten für ALLE)

Diese Werte kommen als Kommentar in `styles/declarations.css` und werden von
allen genau so benutzt. Nicht selbst andere Werte erfinden.

| Bereich | Media Query          | Was passiert grob                          |
|---------|----------------------|--------------------------------------------|
| Desktop | (Standard, kein MQ)  | So wie jetzt                               |
| Tablet  | `max-width: 1000px`  | Sidebar wird schmaler / wird zur Bottom-Nav|
| Mobile  | `max-width: 600px`   | Alles einspaltig, Bottom-Nav, Move-to-Menü |

Schreibweise immer **Mobile-First-Ergänzung per max-width** (Desktop-CSS bleibt
Default, Media Queries überschreiben nach unten).

---

## 2. Ablauf — Schritt 0 kommt ZUERST

**Problem:** Die Sidebar-HTML ist in **8 HTML-Dateien hineinkopiert**
(`board.html`, `summary.html`, `add_task.html`, `contacts.html`, `help.html`,
`legal_notice.html`, `privacy_policy.html`, plus Login über `index.html`).
Sie wird NICHT per JS eingefügt. Wenn zwei Leute das gleichzeitig umbauen,
kracht jeder Merge.

**Lösung:** Person A baut die Sidebar in EIN JS-Template um (`js/templates/nav_template.js`),
so wie `board_template.js` es schon für die Karten macht. Danach existiert die
Navigation an genau einer Stelle.

> **Wichtig:** Schritt 0 wird gemerged, BEVOR B und C ihr responsive CSS committen.
> B und C dürfen vorher ihre Seiten lesen und planen, aber nicht pushen.
> Sonst arbeiten sie auf einer Sidebar, die gleich verschwindet.

---

## 3. Git-Regeln (für alle drei)

1. Jeder auf **eigenem Branch**. Niemals direkt auf `main`.
2. **Eine Seite = ein PR = mergen.** Nicht 5 Seiten sammeln.
3. Nach jedem fremden Merge: `git pull origin main` in den eigenen Branch, dann weiter.
4. **Nur die eigenen Dateien anfassen** (siehe Zuständigkeiten unten).
5. Gemeinsame Dateien (`declarations.css`, `colors.css`, `nav_template.js`)
   ändert nur **A in Schritt 0**. Danach fasst die niemand mehr an.

---

## 4. Zuständigkeiten (Datei-Ebene, damit nichts kollidiert)

| Datei                        | Gehört |
|------------------------------|--------|
| `nav_template.js` (neu)      | A (nur Schritt 0) |
| `sidebar.css`                | A      |
| `declarations.css`           | A (nur Schritt 0) |
| `add_task.css`               | A      |
| `help/legal_notice/privacy` HTML | A  |
| `board.css`, `board.js`      | B      |
| `board.html`                 | B      |
| `summary.css`, `summary.js`  | C      |
| `login.css`, `contact.css`   | C      |

---

# AUFGABE A — Fundament + Add Task + statische Seiten

## A.1 Nav-Template (Schritt 0, blockierend, zuerst mergen)

**Datei:** `js/templates/nav_template.js` (neu)

Was:
- Die Sidebar-Markup (aktuell inline in jeder HTML) in eine JS-Funktion packen,
  die den HTML-String zurückgibt, z.B. `getNavTemplate(activePage)`.
- `activePage` steuert, welcher Nav-Punkt die aktive Klasse bekommt
  (aktuell `nav-active-board`).
- In den 8 HTML-Dateien den kompletten `<div class="sidebar">...</div>`-Block
  ersetzen durch einen Container `<div id="nav"></div>` und beim Laden füllen
  (`document.getElementById('nav').innerHTML = getNavTemplate('board')`).
- `nav_template.js` in allen 8 Dateien als `<script>` einbinden.

Warum: Danach lebt die Navigation an einer Stelle. Bottom-Nav muss nur einmal
gebaut werden statt achtmal.

## A.2 Bottom-Nav CSS (responsive Sidebar)

**Datei:** `styles/sidebar.css`

Aktueller Zustand:
- `.sidebar` = `position: fixed; width: 232px; height: 100vh;` links (Zeile ~17).
- `.container-header` = `left: 232px; width: calc(100% - 232px);` (Zeile ~146).
- Content-Seiten haben `padding-left` um die Sidebar (z.B. `content-board`).

Was in `@media (max-width: 1000px)` / `@media (max-width: 600px)`:
- `.sidebar` von links nach unten: `position: fixed; bottom: 0; width: 100%;
  height: auto; flex-direction: row;`
- `.sidebar-nav` horizontal statt vertikal (`flex-direction: row`), Footer-Links
  (`Privacy/Legal`) und Logo auf Mobile ausblenden (`display: none`).
- `.nav-item` als Icon-über-Text-Block, gleichmäßig verteilt.
- `.container-header` auf `left: 0; width: 100%;` zurücksetzen.
- Content bekommt unten Platz für die Bottom-Nav statt links
  (`padding: ... 0 80px 0`). **Achtung:** die genauen Content-Paddings
  (`content-board` etc.) stehen in den jeweiligen Seiten-CSS — A macht nur die
  Nav; die Content-Paddings pro Seite macht der jeweilige Besitzer (B/C).

## A.3 Add Task responsive

**Datei:** `styles/add_task.css`

Aktueller Zustand (aus `board.html`, Overlay-Form):
- `.form-wrapper` hat `.left-side`, `.separator`, `.right-side` nebeneinander.
- `.priority-container` mit drei Buttons nebeneinander.

Was in Mobile:
- `.form-wrapper` von Zeilen- auf Spalten-Layout (`flex-direction: column`),
  `.separator` ausblenden.
- `.left-side` / `.right-side` auf volle Breite.
- Buttons (`Clear` / `Create Task`) ggf. untereinander oder volle Breite.
- Inputs `width: 100%`.

## A.4 Statische Seiten

**Dateien:** `help.html`, `legal_notice.html`, `privacy_policy.html`

Was:
- Prüfen, dass Textcontainer nicht breiter als der Viewport werden
  (`max-width: 100%`, Bilder `max-width: 100%`).
- Content-Padding an Bottom-Nav anpassen (unten statt links).
- Nav über Schritt-0-Template einbinden.

### Definition of Done A
- Nav liegt in `nav_template.js`, alle 8 Seiten nutzen es.
- Bei ≤600px erscheint die Nav als Bottom-Bar, Header ohne Links-Offset.
- Add Task, Help, Legal, Privacy laufen bei 375px Breite ohne horizontales Scrollen.

---

# AUFGABE B — Board (schwerstes Teil: CSS + JS)

## B.1 Spalten stapeln

**Datei:** `styles/board.css`

Aktueller Zustand:
- `.kanban-board` = `display: flex; justify-content: space-around;` (Zeile 126) — Spalten nebeneinander.
- `.kanban-column` = `width: 252px;` (Zeile 142).
- `.content-board` = `padding: 180px 0 0 322px;` (Zeile 4) — Offset für Sidebar.

Was in Mobile:
- `.kanban-board` auf `flex-direction: column` (Spalten untereinander).
- `.kanban-column` auf `width: 100%`.
- `.content-board` Padding umstellen: links weg (keine Sidebar mehr), unten Platz
  für Bottom-Nav, z.B. `padding: 120px 16px 90px 16px`.
- Suchleiste (`.search-container`) und `Board`-Header auf volle Breite / umbrechen.

## B.2 Move-to-Menü (Ersatz für Drag & Drop auf Mobile)

**Dateien:** `js/board.js` + `js/templates/board_template.js` (Karten-Template)

Gute Nachricht: Die Status-Logik existiert schon. `moveTo(taskCat)` in
`board.js` setzt bereits `tasks[...].taskStatus` und rendert neu. Das Menü muss
sie nur aufrufen — nichts neu erfinden.

Was:
- Auf jeder Mini-Karte einen kleinen Button (nur Mobile sichtbar) einbauen, der
  ein Popup öffnet: „Move to → To do / In progress / Await feedback / Done".
- Aktuell arbeitet `moveTo` mit `currentDraggedElement` (aus Drag & Drop). Für
  das Menü brauchen wir die Task-ID direkt. Zwei Optionen:
  - `moveTo(taskCat, id)` erweitern, sodass die ID optional mitgegeben wird, oder
  - vor dem Aufruf `currentDraggedElement = id` setzen.
  (Mit B absprechen, saubere Variante ist der optionale Parameter.)
- Menü schließt bei Klick daneben.
- Drag & Drop bleibt auf Desktop unangetastet.

### Definition of Done B
- Bei ≤600px liegen die vier Spalten untereinander, keine horizontale Scrollbar.
- Jede Karte hat auf Mobile das Move-to-Menü; ein Klick verschiebt die Karte
  in die richtige Spalte (über bestehendes `moveTo`).
- Desktop-Drag & Drop funktioniert weiterhin.

---

# AUFGABE C — Summary + Login/Signup + Contacts

## C.1 Summary (Stat-Cards + Greeting)

**Dateien:** `styles/summary.css`, `js/summary.js`

Was CSS:
- Stat-Card-Grid auf Mobile einspaltig / passend stapeln (siehe Figma:
  Zahlen-Kacheln untereinander, volle Breite).
- Content-Padding von links (Sidebar) auf unten (Bottom-Nav) umstellen.

Was JS (Greeting):
- Laut Vorlage zeigt Mobile ZUERST einen Vollbild-Greeting
  („Good morning, Sofia Müller"), der dann in die Summary faded.
  Auf Desktop steht das Greeting daneben.
- Umsetzung: beim Laden auf Mobile (Breite prüfen) Greeting-Overlay zeigen,
  nach kurzer Zeit ausblenden (CSS-Transition). Auf Desktop normal daneben.

## C.2 Login / Signup

**Datei:** `styles/login.css`

Was: Am einfachsten. Formular zentriert, `max-width` fürs Mobile, Inputs
`width: 100%`, Logo skalieren. Kaum Struktur-Änderung.

## C.3 Contacts

**Datei:** `styles/contact.css`

Aktueller Zustand: Liste links, Detailansicht rechts nebeneinander.

Was in Mobile:
- Umschalt-Logik statt nebeneinander: erst die Kontaktliste (volle Breite),
  bei Klick auf einen Kontakt die Detailansicht (volle Breite), mit Zurück.
- Prüfen, ob dafür minimales JS nötig ist (Klasse toggeln) — mit C klären,
  ob das in `contact.css` + vorhandenem JS reicht.
- Content-Padding auf Bottom-Nav umstellen.

### Definition of Done C
- Summary bei ≤600px einspaltig; Greeting erscheint auf Mobile zuerst, dann Summary.
- Login/Signup bei 375px zentriert und ohne Überlauf.
- Contacts wechselt auf Mobile zwischen Liste und Detail statt nebeneinander.

---

## 5. Testen (alle)

Chrome DevTools → Gerätesymbol → Breiten prüfen:
- **375px** (iPhone SE) — Hauptziel Mobile
- **768px / 1000px** — Tablet-Übergang
- **1440px** — Desktop darf nicht kaputtgehen

Kein horizontales Scrollen bei 375px. Bottom-Nav auf jeder Seite erreichbar.

## 6. Reihenfolge zusammengefasst

1. **A** macht Schritt 0 (Nav-Template + Bottom-Nav + Breakpoints) → PR → merge.
2. Alle `git pull`.
3. **A / B / C** arbeiten parallel an ihren Seiten, je Seite ein PR.
4. Nach jedem Merge: die anderen pullen.
