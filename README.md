# Classroom Hub — Unterrichtswebsite

Dunkles, responsives, statisches Starterprojekt für Unterrichtsvorbereitung und Unterricht mit Schülern. Kein Framework und kein Build-Schritt erforderlich.

## Projektstruktur

```text
classroom-hub/
├── index.html
├── assets/styles.css
├── js/app.js
├── data/
│   ├── tools.json
│   ├── materials.json
│   └── subjects.json
├── tools/           # eigenständige HTML-Tools
├── subjects/        # Platz für Fachseiten
├── materials/       # öffentliche Materialien
└── exercises/      # Platz für eigene Übungsseiten
```

## Lokal starten

`fetch()` für JSON-Dateien funktioniert oft nicht über `file://`. Starte im Projektordner:

```bash
python -m http.server 8000
```

Öffne dann http://localhost:8000. Alternativ nutze VS Code mit Live Server.

## Inhalte anpassen

- Tools: `data/tools.json` — jeder Eintrag braucht eine eindeutige `id`, `name`, `description`, `category`, `path`.
- Materialien: `data/materials.json` — nutze `path` für lokale öffentliche Dateien oder `url` für externe Ressourcen.
- Fächer/Klassen: `data/subjects.json` — die Arrays `tools` und `materials` referenzieren die IDs aus den jeweiligen JSON-Dateien.
- Demo-Quiz: Fragen stehen in `js/app.js` in der Konstanten `quiz`.
- Planung: Einträge werden in `localStorage` gespeichert und können als JSON exportiert werden. Sie synchronisieren nicht zwischen Geräten.

## GitHub Pages veröffentlichen

1. Erstelle ein Repository, z. B. `classroom-hub`.
2. Lade den gesamten Inhalt dieses Ordners hoch. `index.html` muss im Repository-Hauptverzeichnis liegen.
3. Öffne Repository → Settings → Pages.
4. Wähle `Deploy from a branch`, Branch `main`, Ordner `/(root)` und speichere.
5. Warte auf den Build und öffne die veröffentlichte URL unter Settings → Pages.
6. Da diese Vorlage relative Dateipfade nutzt, funktioniert sie auch unter einer Projekt-URL wie `https://USERNAME.github.io/classroom-hub/`.

Offizielle Doku: https://docs.github.com/pages

## KRITISCH: Zugriffsschutz / Schülerdaten

GitHub Pages ist statisches Hosting und liefert veröffentlichte Dateien öffentlich aus. Ein privates GitHub-Repository macht die veröffentlichte Pages-Website nicht automatisch zu einem geschützten Portal. Versteckte Links, JavaScript-Checks oder ein Login-Formular nur im Frontend sind kein echter Zugriffsschutz.

Diese erste Version hat deshalb absichtlich KEINEN Schein-Login. Verwende sie nur für öffentliche Inhalte und unkritische Tools.

Wenn du tatsächlich geschützte Lehrerbereiche oder Schülerbereiche benötigst, wähle eine der folgenden Architekturen:

### Option A — öffentliche Inhalte auf GitHub Pages + geschützte Bereiche getrennt hosten
- Öffentliche Startseite, öffentliche Tools und allgemeine Materialien auf GitHub Pages.
- Vertrauliche Lehrermaterialien und private Funktionen auf einem Dienst mit serverseitiger Authentifizierung hosten.
- Verlinke diese Bereiche aus dem Dashboard, aber lade vertrauliche Dateien nicht ins öffentliche Repository.

### Option B — gesamtes Portal hinter Access/SSO
- Nutze GitHub als Quellcodeverwaltung, aber hoste die Website bei einem Anbieter, der eine echte Zugriffsschicht vor die gesamte Website setzen kann (z. B. Cloudflare Access mit passender Identitätsrichtlinie).
- Prüfe mit deiner Schule, ob Schülerkonten und Lehrkräfte zuverlässig unterstützt werden. Eine einzige Zugriffsschranke schützt die ganze Website; getrennte Rollen/Permissions brauchen zusätzliche Konfiguration.

### Option C — echtes Portal mit Rollen und Daten
- Für unterschiedliche Schüler-/Lehrerrechte, Konten, gespeicherte Daten und Aufgabenabgaben brauchst du Backend/Auth (z. B. Supabase oder Firebase) und passende Datenbankregeln.
- Schülerdaten nur mit schulischer Datenschutzfreigabe und nach den geltenden Vorgaben verarbeiten. Keine Noten, Namen, Diagnosen oder individuellen Lernstände in localStorage oder öffentliche Dateien schreiben.

## Funktionsumfang dieser ersten Version

- Responsives dunkles Dashboard
- Navigation, Suche und Fach-/Klassenbereiche
- Zentrale Tool-, Material- und Fachkonfiguration per JSON
- Eigenständige HTML-Tools über separate Tabs
- Timer und zufällige Gruppenbildung
- Demo-Quiz
- Einfache Unterrichtsnotizen lokal im Browser plus JSON-Export

Dies ist ein Frontend-Prototyp, kein vollständiges Lernmanagementsystem und noch kein geschützter Bereich.
