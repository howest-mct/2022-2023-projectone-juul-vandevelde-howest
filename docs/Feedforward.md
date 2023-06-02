# DeliverEase Mailbox

**VOORNAAM NAAM:** Juul Van de Velde

**Sparringpartner:** Maxim Ravich

**Projectsamenvatting in max 10 woorden:** Een slimme brievenbus die zowel brieven als pakketjes kan ontvangen

**Projecttitel:** DeliverEase Mailbox

# Tips voor feedbackgesprekken

## Voorbereiding

> Bepaal voor jezelf waar je graag feedback op wil. Schrijf op voorhand een aantal punten op waar je zeker feedback over wil krijgen. Op die manier zal het feedbackgesprek gerichter verlopen en zullen vragen, die je zeker beantwoord wil hebben, aan bod komen.

## Tijdens het gesprek:

> **Luister actief:** Schiet niet onmiddellijk in de verdediging maar probeer goed te luisteren. Laat verbaal en non-verbaal ook zien dat je aandacht hebt voor de feedback door een open houding (oogcontact, rechte houding), door het maken van aantekeningen, knikken...

> **Maak notities:** Schrijf de feedback op zo heb je ze nog nadien. Noteer de kernwoorden en zoek naar een snelle noteer methode voor jezelf. Als je goed noteert,kan je op het einde van het gesprek je belangrijkste feedback punten kort overlopen.

> **Vat samen:** Wacht niet op een samenvatting door de docenten, dit is jouw taak: Check of je de boodschap goed hebt begrepen door actief te luisteren en samen te vatten in je eigen woorden.

> **Sta open voor de feedback:** Wacht niet op een samenvatting door de docenten, dit is jouw taak: Check of je de boodschap goed hebt begrepen door actief te luisteren en samen te vatten in je eigen woorden.`

> **Denk erover na:** Denk na over wat je met de feedback gaat doen en koppel terug. Vind je de opmerkingen terecht of onterecht? Herken je je in de feedback? Op welke manier ga je dit aanpakken?

## NA HET GESPREK

> Herlees je notities en maak actiepunten. Maak keuzes uit alle feedback die je kreeg: Waar kan je mee aan de slag en wat laat je even rusten. Wat waren de prioriteiten? Neem de opdrachtfiche er nog eens bij om je focuspunten te bepalen.Noteer je actiepunten op de feedbackfiche.

# Feedforward gesprekken

## Gesprek 1 (Datum: 24/05/2023)

Lector: Geert Desloovere & Dieter Roobrouck

Dit is de feedback.

- feedback 1: boek een consult om het fritzing schema na te laten kijken (zeker het deel van de transistor!)
- feedback 2: zorg voor een doos zodat de schakeling eenvoudig verplaatst kan worden zonder af te breken
- feedback 3: zorg dat de leerkrachten mijn volledig gebouwde schakeling kunnen zien (alles in 1 schakeling, niet alles apart)

## Gesprek 2 (Datum: 24/05/2023)

Lector: Stijn Walcarius

Vragen voor dit gesprek:

- vraag 1: Hoe wachtwoord veilig opslaan in database?
- vraag 2: Welk datatype gebruiken voor 'value'?

Dit is de feedback op mijn vragen.

- feedback 1: Dit is redelijk moeilijk, voorlopig gewoon opslaan als een str. (Indien tijd over kan ik hier meer informatie over vragen)
- feedback 2: Varchar is goed, de lengte hangt af van de langste waarde. In de meeste gevallen is dit de data van een RFID sensor.

## Gesprek 3 (Datum: 25/05/2023)

Lector: Christophe Laprudence 

Vragen voor dit gesprek:

- vraag 1: TypeError: Object of type datetime is not JSON serializable

Dit is de feedback op mijn vragen.

- feedback 1: Je kan beter eerst je data opvragen via een route, als er dan nieuwe data is kan je deze toevoegen via een websocket.

## Gesprek 4 (Datum: 25/05/2023)

Lector: Pieter-Jan Beeckman

Vragen voor dit gesprek:

- vraag 1: Is mijn fritzing schema correct? Geen grote fouten die kortsluiting veroorzaken?
- vraag 2: Betere manier om (meer) RGB's aan te sluiten?

Dit is de feedback op mijn vragen.

- feedback 1: Ziet er al veel beter uit, wel nog kleuren van de + veranderen, 3.3V = oranje en 5V = rood (zijn nu beiden rood). Ook in de breadboard view misschien wat meer witruimte toevoegen zodat draadjes eenvoudiger te volgen zijn.
- feedback 2: Het eenvoudigste zou zijn om een neopixel led strip/ring te kopen. Deze kan je later ook nog goed gebruiken en geeft meer licht terwijl het minder GPIO pinnen in gebruik neemt.

## Gesprek 5 (Datum: 30/05/2023)

Lector: Geert Desloovere, Claudia Eeckhout, Dieter Roobrouck

Dit is de feedback.

- feedback 1: Github kan beter, maar 1 feature commit per branch. Als je tussentijds commits doet, begin dan niet met 'feat:'.
- feedback 2: Denk nog wat extra na over de behuizing.
- feedback 3: Begin misschien ook al aan de UX.
- feedback 4: Op tijd komen voor de toer momenten (8u30).

## Gesprek 6 (Datum: 02/06/2023)

Lector: Claudia Eeckhout

Vragen voor dit gesprek:

- vraag 1: Algemene feedback op mijn UX

Dit is de feedback op mijn vragen.

- feedback 1: Begin altijd mobile first!
- feedback 2: Het is vooral belangrijk om het design te testen vooraleer je het designed, zorg dat alles duidelijk en toegankelijk is.
- feedback 3: Zorg ervoor dat alles wat je toont relevant is voor de eindgebruiker, een database dump is onoverzichtelijk. In plaats van bijvoorbeeld enkel de historiek weer te geven van wanneer de brievenbus geopend werd, toon je misschien beter ook wie die had geopend.
- feedback 4: Zorg ervoor dat je bijvoorbeeld aan account aan kan maken voor je buur, zodat deze tijdens dat je op reis bent je brievenbus niet elke dag hoeft te checken.
- feedback 5: Temperatuur is leuk maar dit lost het hoofd probleem niet op, zet het dus ook bijvoorbeeld niet in de fold.
- feedback 6: Verander de tekst bij de lighting, het is een beetje verwarrend dat er staat tot hoelang deze gaat branden. Terwijl de card bedoelt is om de kleur er van te veranderen.
- feedback 7: Scrollen op de home page is niet zo fijn, probeer de belangrijkste info in de fold te steken. 
- feedback 8: Probeer te denken zoals de gebruiker. 
- feedback 9: Het door icoontje op zich is misschien al genoeg, in plaats van een hele card. Dit kan je dan user testen om te zien of het wel duidelijk genoeg is.



## Gesprek 7 (Datum: xx/06/2023)

Lector: Hans Ameel / Geert Desloovere

Vragen voor dit gesprek:

- vraag 1: Hoe storing door solenoid weg filteren? Condensator? Diode? (activatie solenoid triggered de callback van een andere sensor)

Dit is de feedback op mijn vragen.

- feedback 1: 
