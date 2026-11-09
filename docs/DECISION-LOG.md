# Entscheidungsverlauf

**Zeitraum:** 7.–9. November 2026  
**Gegenstand:** EU-TED-Datenagent, autonome Auffindbarkeit und optionales LLM-Reasoning.  
**Abschlussstatus:** Produktentwicklung bewusst pausiert.

## 1. Ausgangshypothese

EU-Vergabebekanntmachungen sind öffentlich verfügbar und per API zugänglich. Ein Agent könnte daraus eine strukturierte, nachprüfbare Entscheidungsgrundlage erzeugen und sich perspektivisch an andere Softwareagenten verkaufen.

Die erste These war technisch: *Source-backed retrieval + begrenzte Inferenz kann zuverlässig betrieben werden.* Sie wurde überprüft, unter anderem durch echte TED- und Workers-AI-Aufrufe und einen öffentlich erreichbaren, aber geschützten Cloudflare-Worker.

## 2. Produkt- und Architekturentscheidung

Ein modularer Monolith wurde gegenüber einer verteilten Architektur bevorzugt. Gründe: geringe Startkosten, weniger externe Abhängigkeiten, klar kontrollierbare API-Grenzen und die Möglichkeit, Komponenten später auszulagern. Inference- und Payment-Funktionen wurden zunächst voneinander getrennt; ein öffentlicher Bezahlbetrieb wurde nicht freigegeben.

Der Code entstand unter intensiver Mitwirkung von KI-Werkzeugen. Die Implementierungs- und Testprotokolle im privaten Ursprungsrepository dokumentieren die technische Ausführung. Diese Fallstudie ist keine Behauptung einer eigenständig von Hand programmierten Anwendung.

## 3. Das erste falsifizierende Signal

Das einfache Summarizing erwies sich als unzureichend für einen höherpreisigen Entscheidungssupport: Sprachlich gute Kurzantworten enthielten nicht zuverlässig Fristzeit, Dokumentenlücken oder explizite Unsicherheiten. Daraufhin wurde der Output um einen regelbasierten Decision Brief ergänzt.

Diese Verbesserung bietet nachvollziehbare Prozesshinweise, ist aber kein Beleg dafür, dass Kunden damit Zeit sparen oder bereit wären zu zahlen.

## 4. Folgehypothese: Änderungsintelligenz

An fünf TED-Versionen einer polnischen Bekanntmachung wurden vier Verschiebungen der Angebotsfrist erkannt. Ein Vergleich bereits vorliegender behördlicher Anlagen führte zu weiteren Änderungssignalen. Damit zeigte sich eine mögliche technisch interessante Produktdifferenzierung.

Die Hypothese wurde allerdings zugleich komplizierter: Nicht nur Textzusammenfassungen, sondern Dokumentenversionen, Vergabeverfahrensrecht, fachliche Eignung, Quellenrechte und unterschiedliche Datenquellen mussten zuverlässig zusammenwirken.

## 5. Kontrollierter A/B-Test

Um einen unfairen Quellenvorteil zu vermeiden, erhielten Baseline und SFS denselben zuvor extrahierten Evidenzsatz. SFS bekam zusätzlich aus diesem Satz berechnete Risikohinweise. Ergebnis der vier Modellaufrufe: Die Fakten waren in beiden Varianten korrekt; beim Quellenbezug lag SFS knapp zurück.

**Beobachtung:** Zusätzliche SFS-Prompt-Hinweise allein brachten keinen nachweisbaren Qualitätsgewinn.

**Nicht bewiesen:** Dass eine vollständige, systematisch betriebene Dokumenten- und Änderungsverarbeitung keinen Nutzen haben könnte.

## 6. Stop-Entscheidung

Die noch offene These lässt sich untersuchen, verlangt aber mehrere Fachgebiete und ein wesentlich größeres Testdesign, einschließlich unbearbeiteter Quelldokumente, Fachvalidierung, Weiterverwendungsrechten und echter Nutzerentscheidungen.

Eine solche Entwicklung wäre grundsätzlich möglich. **Für eine eigenständige Weiterführung zum jetzigen Zeitpunkt ist ihr erwarteter Nutzen relativ zu Lernaufwand, operativer Komplexität und fehlender Kommerzialisierungsevidenz nicht überzeugend genug.** Ein neues Team oder eine deutlich stärkere Ausgangsthese könnte diese Einschätzung ändern.

Die Entscheidung ist deshalb kein retrospektiv als Erfolg verpacktes Scheitern, sondern ein bewusst dokumentiertes *Go/No-Go* nach dem ersten belastbaren Gegenbeweis.

## 7. Ergebnis der Arbeit

Ein nutzbarer technischer Prototyp, Quellennachweise, eine regelbasierte Risikologik, reproduzierbare numerische Testauswertung und die Erkenntnis, welche Hypothesen **nicht** gestützt wurden. Für technische Rollen ist das als Arbeitsprobe relevant: Anforderungen präzisieren, Systeme integrieren, Tests ernst nehmen und die Konsequenz aus einem negativen Experiment ziehen.
