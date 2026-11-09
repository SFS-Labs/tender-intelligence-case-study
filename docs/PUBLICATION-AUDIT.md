# Veröffentlichungs-Audit

**Stand:** 2026-11-09  
**Ziel:** Eine technisch lesbare, ehrliche Fallstudie für Recruiter und mögliche spätere Partner bereitstellen, ohne den privaten Forschungs- und Betriebsbestand zu veröffentlichen.

## Prüfergebnis nach Inhalt

| Bereich | Entscheidung | Begründung |
|---|---|---|
| Öffentlich verlinkte TED-Bekanntmachungen | Einbeziehen | EU TED erlaubt Bekanntmachungsreuse grundsätzlich, mit Hinweisen auf mögliche Drittinhalte. |
| Eigener Code zur bounded TED-API, Normalisierung und Decision Brief | Ausgewählt übernehmen | Eigenständige Module; keine externen Pakete oder Zugangsdaten erforderlich. |
| Synthetische Offline-Tests | Einbeziehen | Keine Original-Vergabedokumente; technische Logik überprüfbar. |
| Aggregierte vier A/B-Resultate | Einbeziehen, Herkunft begrenzen | Rechnungen vollständig offline prüfbar, Roh-Originalantworten nicht öffentlich. |
| Vollständige Buyer-PDFs und polnische SWZ-Inhalte | Ausschließen | Weiterverwendungsrechte ungeklärt, mögliche Rechte Dritter. |
| Cloudflare-Keys, Github OIDC-Testpfade, interne Secrets | Ausschließen | Kein Sicherheits- und Integrationsrisiko für das öffentliche Repository. |
| Frühere Branches, nicht zugehöriger Affiliate-Code, Live-Logs | Ausschließen | Nicht Teil der Fallstudie, History-Exposure vermeiden. |
| Behauptete unabhängige Qualitäts-/Rechtssicherheitsfreigabe | Ausschließen | Nicht durchgeführt. |
| Öffentliche Bezahlfunktion oder Live-Vertriebsversprechen | Ausschließen | Nicht umgesetzt und nicht belegt. |

## Technischer Kontrollumfang

- Neue Repository-Historie, keine Git-Objekte oder Commit-Parents des internen Projekts.
- Keine Cloudflare-, Payment- oder GitHub-Zugangsdaten in der Public-Version.
- Testausführung über Node.js Built-ins, ohne fremde npm-Abhängigkeiten.
- CI nutzt ausschließlich synthetische Fixtures und veröffentlichte Aggregate; keine geheimen GitHub Secrets, keine Live-Modellaufrufe und kein TED-Scraping.
- Die Beispiele zeigen die Unterscheidung zwischen als Quelle behaupteter Provenienz und tatsächlich vom Test extern verifizierter Herkunft.

## Nicht überprüfte Punkte

Dieses Audit ist eine dokumentierte Bestandsprüfung, keine anwaltliche Urheberrechts- oder umfassende Sicherheitsexpertise. Die zugrundeliegenden Originale der Behörde liegen nicht in dieser öffentlichen Veröffentlichung; ihre Rechte bleiben ungeklärt. Die A/B-Messung ist nicht von externen Auditoren wiederholt worden.

## Endzustand

Private Quelle und kontrollierter öffentlicher Fallstudien-Ausschnitt bleiben getrennt. Eine mögliche spätere Lizenzierung, Veröffentlichung vollständiger Buyer-Dokumente oder Erweiterung zum kommerziellen Produkt bedarf neuer, ausdrücklicher Entscheidungen.
