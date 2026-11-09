# Methodik und Grenzen

## Fragestellung

Liefert ein KI-gestützter Vergabeagent einen belegbar besseren entscheidungsrelevanten Output als ein Agent, der dieselben bereits extrahierten Quellenfakten unmittelbar verarbeitet?

Die enger formulierte Hypothese war: *Eine zusätzliche deterministische SFS-Strukturierung verbessert die sachliche Korrektheit und belegbare Quellenzuordnung der Modellantwort.*

## Technischer Aufbau

Das Forschungsprojekt verwendete die offizielle [TED Search API v3](https://ted.europa.eu/en/help/data-reuse), JavaScript auf Cloudflare Workers und Workers AI mit `@cf/google/gemma-4-26b-a4b-it`. Die API-Antworten wurden in kanonische Metadaten mit Quellenhinweisen überführt. Narrative Modellantworten wurden getrennt von deterministischen Quellendaten und ausdrücklich ungeprüften Eignungs- und Vergabeinformationen ausgewiesen.

Ein vorangehender Vier-Fälle-Benchmark nutzte Bekanntmachungen verschiedener CPV-Bereiche. Dabei wurden technisch gültige Kurzfassungen erzeugt, jedoch wesentliche prozessuale Hinweise zu Abgabetermin, Unterlagen und Eignung in der Prosa nicht zuverlässig genannt. Daraufhin wurde ein deterministischer Decision Brief eingeführt, der fehlende Nachweise und Prüfschritte unabhängig vom Modell kennzeichnet.

Ein weiterer privater Forschungsfall aus Kraków zeigte vier Fristverschiebungen über fünf öffentliche TED-Versionen. Dort wurden auch Änderungen an behördlichen Anlagen analysiert. **Die entsprechenden Vergabeanlagen und extrahierten längeren Inhaltszusammenfassungen werden hier nicht veröffentlicht.**

## P1.3 – Gleiche Evidenz, zwei Verarbeitungspfade

Beide unabhängigen Modellaufrufe erhielten dieselben *bereits aufbereiteten* Quellenfakten aus einem eingefrorenen Forschungsfall. Der Baseline-Agent nutzte ausschließlich diese Fakten. Der SFS-Agent erhielt dieselben Fakten und zusätzliche algorithmisch berechnete Chronologie-, Quellen- und Warnhinweise.

Die Prompt-Fragen, das verlangte Ausgabeformat, Modell, Temperatureinstellung (0) und Begrenzung der Ausgabetokens (maximal 1.200) waren gleich. Die Ausführungsreihenfolge war A–B–B–A. Vor der Modellmessung standen das 16-Punkte-Schema und die erwarteten Quellentypen fest.

**Wichtig:** SFS hatte mehr Eingabetokens, weil seine berechneten Hinweise zusätzlich übermittelt wurden. Die Aufbereitung des gemeinsamen Quellpakets war bereits vor dem Test erfolgt. Deren Entwicklungs- und Aufbereitungskosten sind nicht enthalten.

## Bewertungsregel

Pro Lauf wurden 16 Zielwerte geprüft: Frist mit Zeitzone, UTC-Frist, Anzahl und Tage der Änderungen, Referenzdauer, Systemnutzerzahl, Teamgröße, Bietungssicherheit, maximale Reaktionszeit für kritische Fehler, optionale Entwicklungsstunden und Garantiefrage, geänderter Ansprechpartner, erneute Prüfung einer Anlage sowie offene Unsicherheit zu Angebotsstatus, Bietereignung und kommerzieller Weiterverwendung.

Ein Wert zählte nur dann als vollständig bestanden, wenn er richtig war **und** eine der vorab erwarteten originalen Quellenkennungen zitiert wurde. Aussagen über den Status als „offen“, rechtliche Eignung oder Weiterverwendung ohne Verifikation waren unerwünscht. Diese 16 programmatischen Kontrollen ersetzen keine unabhängige Fachbegutachtung.

Das Original-Evidenzpaket, die vollständigen Originalantworten und die ursprünglichen GitHub-Actions-Logs sind aus Rechte- und Vertraulichkeitsgründen nur im privaten Forschungsrepository vorhanden. Dieses Public Repo enthält ausschließlich aggregierte und abstrahierte Bewertungswerte. Die [Offline-Rechenprüfung](../scripts/verify.mjs) reproduziert die Addition, **nicht** die inhaltliche Wahrheit jeder ursprünglich bewerteten Aussage.

## Beobachtete Ergebnisse

| Maß | Baseline | SFS |
|---|---:|---:|
| Antworten | 2 | 2 |
| Richtige Fakten | 32/32 | 32/32 |
| Quellenunterstützte richtige Fakten | 26/32 | 25/32 |
| Ø Modelllaufzeit | 15,5725 s | 13,1065 s |
| Ø Modellverbrauch | 41,2545 Neurons | 37,9636 Neurons |
| Ø Eingabetokens | 2.726 | 3.108 |

Die SFS-Variante hatte **keinen nachgewiesenen Qualitätsvorteil**. Der numerische Unterschied in der Laufzeit ist bei nur zwei Wiederholungen je Arm nicht aussagekräftig. Beide Varianten hatten jeweils fehlende Quellenverweise zu mehreren Unsicherheitsfeldern. Es wurde keine falsche definitive Aussage zur Angebotsöffnung oder Eignung beobachtet.

## Gültigkeit, die wir nicht behaupten

Die Stichprobe stammt aus **einem** Vergabeverfahren, nicht aus einer breiten Zufallsauswahl. Es gab keine verblindete unabhängige Sachverständigenprüfung, keinen Test mit identischem Zugang zu den unbearbeiteten PDF-Originaldateien, keine Kundenzeitmessung, keine Zahlungsbereitschaftsstudie und keine statistisch belastbare Performance-Gewissheit.

Die strukturierten SFS-Hinweise waren eine **Ergänzung im Prompt**, kein vollautomatisch validierter Kundenworkflow. Daraus kann man weder ein generelles Scheitern von Change Intelligence noch eine marktfähige Überlegenheit ableiten.

## Reproduzierbare Bestandteile

Nach dem Klonen:

```sh
npm test
npm run verify
```

Beide Schritte laufen lokal ohne Cloudkonto und ohne Modellaufrufe. Die Codebeispiele zur TED-Suche verwenden in Tests ausschließlich synthetische HTTP-Antworten. Eine tatsächliche Live-Abfrage erfordert Internetzugang und bleibt außerhalb der CI.

Die ausführlichen Modelltranskripte werden nicht so dargestellt, als wären sie durch dieses öffentliche Repository unabhängig reproduzierbar.
