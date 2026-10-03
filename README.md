# S.W.A.T. Prüfungsportal

GitHub-Pages-Version für `Ben0989/swat`, verbunden mit dem bestehenden Supabase-Projekt BWGs.

## Funktionen

- 55 Fragen und Musterantworten aus der bereitgestellten PDF, wortgetreu; PDF-Zeilenumbrüche werden zu Leerzeichen.
- Alle Fragen einschließlich Multiple Choice werden vom Prüfer mit 0 bis 3 Punkten bewertet.
- Bestanden ab 132 von 165 Punkten (80 %).
- Einblendbare Musterantworten, Notizen, Fragenübersicht und Fortschritt.
- Prüfungen speichern, pausieren, fortsetzen und abschließen.
- Ergebnisübersicht nach Kategorien und druckbares Prüfungsprotokoll.

## GitHub Pages aktivieren

Repository → Settings → Pages → Build and deployment → Source: **GitHub Actions**.

Anschließend unter Actions den Workflow „Publish SWAT to GitHub Pages“ starten oder einen fehlgeschlagenen Lauf erneut ausführen. Die Zieladresse ist `https://ben0989.github.io/swat/`. Jeder weitere Push auf `main` baut und veröffentlicht automatisch.

Alternativ kann die bereits gebaute Fassung ohne Actions veröffentlicht werden: Pages → Source „Deploy from a branch“ → Branch `main` → Verzeichnis `/docs` → Save. Bei Quellcodeänderungen dann `npm run build` ausführen und `docs` mitcommitten.

## Prüfer-Zugang

Der gemeinsame Zugangscode wird separat und ausschließlich privat übergeben. Er steht weder hier noch in den JavaScript-Dateien. Jeder mit gültigem Code kann sämtliche SWAT-Prüfungen sehen und Entwürfe bearbeiten; es gibt keine persönlichen Rollen. Der Browser hält den Code nur für die aktuelle Sitzung in sessionStorage. „Prüfer-Zugang schließen“ entfernt ihn.

Im öffentlichen Code steht lediglich ein für Frontends vorgesehener Supabase-Publishable-Key. RLS verlangt zusätzlich einen gültigen Prüfer-Code. Ohne Code sind SWAT-Datensätze nicht les- oder schreibbar. Der Code kann in den SWAT-Pages-RLS-Policies rotiert werden; nur sein SHA-256-Hash wird in der Datenbankprüfung gespeichert. Keine geheimen Supabase-Service-Schlüssel im Browser verwenden.

## Datenbank

Vorhandene BWG-Daten werden nicht verändert. SWAT nutzt `public.swat_questions` und `public.swat_exams`. Ein Datenbank-Trigger validiert alle Bewertungen, berechnet Punkte und Bestehen unabhängig vom Browser und schützt abgeschlossene Prüfungen. Versionsnummern verhindern unbemerktes Überschreiben paralleler Änderungen.

Die ursprüngliche private ChatGPT-Site kann weiter auf dieselben Daten zugreifen. Der SQL-Stand im Ordner `supabase` ist Dokumentation bereits angewendeter Änderungen und darf nicht erneut auf die bestehende Datenbank angewendet werden. Der Zugangscode selbst ist nicht enthalten.

## Lokal entwickeln

Node.js 24 verwenden:

```sh
npm ci
npm run dev
npm test
npm run build
```

Vite erzeugt `docs/` mit Basis-Pfad `/swat/`. Es sind keine GitHub-Secrets und kein eigener Webserver erforderlich. Die Datenbankverbindung liegt in `src/database.ts`. Keine Prüfungsdaten werden ins Repository geschrieben.

## Prüfungen

TypeScript und Produktionsbuild sowie Tests für 131/132 Punkte, unvollständige Prüfungen und ungültige Punktwerte. Datenbanktests bestätigen Zugangsschutz, 55 Fragen, serverseitige Summenbildung und Versionszählung. Browser-End-to-End-Tests wurden nicht durchgeführt.
