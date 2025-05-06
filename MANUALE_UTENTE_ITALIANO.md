# Portfolio di Architettura LGC - Manuale Utente

## Indice
1. [Introduzione](#introduzione)
   - [Panoramica del Sistema](#panoramica-del-sistema)
   - [Requisiti Tecnici](#requisiti-tecnici)
   - [Browser Supportati](#browser-supportati)
2. [Iniziare](#iniziare)
   - [Registrazione Account](#registrazione-account)
   - [Accesso](#accesso)
   - [Recupero Password](#recupero-password)
   - [Gestione Profilo Utente](#gestione-profilo-utente)
   - [Navigazione dell'Interfaccia](#navigazione-dellinterfaccia)
3. [Funzionalità Utente](#funzionalità-utente)
   - [Navigazione Progetti](#navigazione-progetti)
   - [Visualizzazione Dettagli Progetto](#visualizzazione-dettagli-progetto)
   - [Visualizzatore Documenti](#visualizzatore-documenti)
   - [Lettore Video](#lettore-video)
   - [Filtro Progetti e Ricerca](#filtro-progetti-e-ricerca)
   - [Contattare lo Studio di Architettura](#contattare-lo-studio-di-architettura)
   - [Salvare Preferiti](#salvare-preferiti)
4. [Dashboard Cliente](#dashboard-cliente)
   - [Accesso alla Dashboard](#accesso-alla-dashboard)
   - [Visualizzazione dei Tuoi Progetti](#visualizzazione-dei-tuoi-progetti)
   - [Monitoraggio Stato Progetto](#monitoraggio-stato-progetto)
   - [Comunicazione con lo Studio di Architettura](#comunicazione-con-lo-studio-di-architettura)
5. [Funzionalità Amministratore](#funzionalità-amministratore)
   - [Dashboard Amministratore](#dashboard-amministratore)
   - [Gestione Progetti](#gestione-progetti)
   - [Aggiunta Nuovi Progetti](#aggiunta-nuovi-progetti)
   - [Modifica Progetti Esistenti](#modifica-progetti-esistenti)
   - [Eliminazione Progetti](#eliminazione-progetti)
   - [Gestione Utenti](#gestione-utenti)
   - [Statistiche e Analisi](#statistiche-e-analisi)
6. [Opzioni Lingua](#opzioni-lingua)
   - [Cambiare la Lingua dell'Interfaccia](#cambiare-la-lingua-dellinterfaccia)
   - [Traduzione Contenuti](#traduzione-contenuti)
7. [Risoluzione Problemi](#risoluzione-problemi)
   - [Problemi di Accesso](#problemi-di-accesso)
   - [Problemi di Visualizzazione Progetti](#problemi-di-visualizzazione-progetti)
   - [Problemi di Caricamento](#problemi-di-caricamento)
   - [Problemi di Compatibilità Browser](#problemi-di-compatibilità-browser)
   - [Messaggi di Errore Comuni](#messaggi-di-errore-comuni)
8. [Considerazioni sulla Sicurezza](#considerazioni-sulla-sicurezza)
   - [Sicurezza Password](#sicurezza-password)
   - [Protezione Dati](#protezione-dati)
   - [Gestione Accesso Amministratore](#gestione-accesso-amministratore)
9. [Contattare il Supporto](#contattare-il-supporto)
   - [Canali di Supporto](#canali-di-supporto)
   - [Segnalazione Bug](#segnalazione-bug)
   - [Richieste Funzionalità](#richieste-funzionalità)
10. [Domande Frequenti](#domande-frequenti)
11. [Glossario](#glossario)

## Introduzione

### Panoramica del Sistema

Il Portfolio di Architettura LGC è un'applicazione web completa progettata per mostrare progetti architettonici, gestire le relazioni con i clienti e fornire strumenti amministrativi per la gestione del portfolio. Questo sistema consente ai visitatori di sfogliare i portfolio di progetti, mentre gli utenti registrati possono accedere a dashboard personalizzate e gli amministratori possono gestire l'intera piattaforma.

L'applicazione è costruita utilizzando tecnologie web moderne tra cui HTML5, CSS3 e JavaScript, con Supabase come servizio di database backend. Presenta un design responsive che funziona su desktop, tablet e dispositivi mobili.

Le caratteristiche principali del sistema includono:
- Navigazione pubblica del portfolio con visualizzatori di progetti interattivi
- Visualizzazione di documenti e contenuti video con visualizzatori integrati
- Account cliente con dashboard di progetto personalizzate
- Strumenti amministrativi per la gestione del portfolio
- Supporto multilingua
- Sistema di autenticazione sicuro
- Strumenti di comunicazione interattivi

### Requisiti Tecnici

Per utilizzare efficacemente il sistema Portfolio di Architettura LGC, il tuo dispositivo dovrebbe soddisfare i seguenti requisiti:

- **Connessione Internet**: Connessione a banda larga (1 Mbps o superiore consigliata)
- **Risoluzione Schermo**: Minimo 1280 x 720 pixel (il design responsive supporta dispositivi mobili)
- **Archiviazione**: Almeno 100MB di spazio libero per la cache del browser
- **Memoria (RAM)**: Minimo 2GB (4GB o superiore consigliata)

### Browser Supportati

Il Portfolio di Architettura LGC è ottimizzato per i seguenti browser (ultime versioni consigliate):

- Google Chrome (versione 90 o superiore)
- Mozilla Firefox (versione 88 o superiore)
- Microsoft Edge (versione 90 o superiore)
- Safari (versione 14 o superiore)
- Opera (versione 76 o superiore)

Anche i browser mobili su iOS e Android sono supportati, ma alcune funzionalità potrebbero avere una funzionalità limitata rispetto alle versioni desktop.

## Iniziare

### Registrazione Account

1. Naviga alla pagina di registrazione cliccando su "Registrati" nella barra di navigazione in alto o andando direttamente a `register.html`.
2. Apparirà il modulo di registrazione con i seguenti campi:
   - **Nome utente**: Crea un nome utente unico (3-20 caratteri, alfanumerico)
   - **Password**: Crea una password sicura
   - **Conferma Password**: Reinserisci la tua password per verifica
3. Crea una password forte che soddisfi i seguenti requisiti:
   - Almeno 8 caratteri
   - Contiene almeno una lettera maiuscola (A-Z)
   - Contiene almeno una lettera minuscola (a-z)
   - Contiene almeno un numero (0-9)
   - Contiene almeno un carattere speciale (!@#$%^&*()_+-=[]{}|;':",./<>?)
4. Rivedi i Termini di Servizio e l'Informativa sulla Privacy, quindi spunta la casella "Accetto".
5. Completa la verifica CAPTCHA se richiesto.
6. Clicca sul pulsante "Registrati" per inviare la tua registrazione.
7. Il sistema convaliderà le tue informazioni:
   - Se il tuo nome utente è già in uso, riceverai un messaggio di errore.
   - Se la tua password non soddisfa i requisiti, verranno fornite indicazioni specifiche.
8. Dopo la registrazione riuscita, vedrai un messaggio di conferma e sarai reindirizzato alla pagina di accesso.

**Nota**: Le informazioni di registrazione sono archiviate in modo sicuro nel database del sistema. La tua password è criptata e non può essere visualizzata dagli amministratori.

### Accesso

1. Naviga alla pagina di accesso cliccando su "Accedi" nella barra di navigazione in alto o andando direttamente a `login.html`.
2. Inserisci il tuo nome utente registrato nel campo "Nome utente".
3. Inserisci la tua password nel campo "Password".
4. Opzionale: Spunta la casella "Ricordami" per rimanere connesso su questo dispositivo.
5. Clicca su "Accedi" per accedere al tuo account.
6. Se le tue credenziali sono corrette, sarai reindirizzato alla homepage con accesso personalizzato.
   - La barra di navigazione mostrerà ora il tuo nome utente.
   - Avrai accesso alla tua dashboard personale.
7. Se le tue credenziali sono errate, apparirà un messaggio di errore. Puoi:
   - Riprovare con le informazioni corrette.
   - Cliccare su "Password Dimenticata" se hai bisogno di reimpostare la tua password.

**Suggerimento di Sicurezza**: Assicurati sempre di essere sul sito web corretto prima di inserire le credenziali di accesso. Cerca "https" nella barra degli indirizzi, che indica una connessione sicura.

### Recupero Password

Se hai dimenticato la tua password, segui questi passaggi per recuperare il tuo account:

1. Nella pagina di accesso, clicca su "Password Dimenticata" sotto il modulo di login.
2. Inserisci il tuo nome utente registrato nel campo fornito.
3. Clicca su "Reimposta Password" per inviare la tua richiesta.
4. Il sistema mostrerà un messaggio di conferma.
5. Segui le istruzioni di reimpostazione della password che verranno inviate al tuo indirizzo email registrato.
6. Nell'email di reimpostazione della password, clicca sul link sicuro per impostare una nuova password.
7. Inserisci una nuova password che soddisfi i requisiti di sicurezza.
8. Conferma la tua nuova password inserendola nuovamente.
9. Clicca su "Salva Nuova Password" per aggiornare le tue credenziali.
10. Sarai reindirizzato alla pagina di accesso dove potrai utilizzare la tua nuova password.

**Nota**: I link di reimpostazione della password sono validi per 24 ore. Per motivi di sicurezza, dovrai richiedere un nuovo link se scade.

### Gestione Profilo Utente

Dopo aver effettuato l'accesso, puoi gestire le informazioni del tuo profilo:

1. Clicca sul tuo nome utente nella barra di navigazione in alto.
2. Seleziona "Profilo" dal menu a discesa.
3. Nella tua pagina del profilo, puoi:
   - Aggiornare il tuo nome visualizzato
   - Cambiare la tua password
   - Aggiornare le informazioni di contatto
   - Impostare preferenze di comunicazione
4. Per cambiare la tua password:
   - Inserisci la tua password attuale
   - Inserisci una nuova password che soddisfi i requisiti di sicurezza
   - Conferma la nuova password
   - Clicca su "Aggiorna Password"
5. Per aggiornare altre informazioni del profilo:
   - Apporta le modifiche desiderate nei campi appropriati
   - Clicca su "Salva Modifiche"
6. Apparirà un messaggio di conferma quando le tue modifiche sono state salvate con successo.

### Navigazione dell'Interfaccia

L'interfaccia del Portfolio di Architettura LGC è progettata per essere intuitiva e facile da navigare. Ecco una dettagliata suddivisione degli elementi principali dell'interfaccia:

- **Barra di Navigazione Superiore**: Situata nella parte superiore di ogni pagina, contenente:
  - **Logo**: Clicca per tornare alla homepage
  - **Home**: Ritorna alla pagina principale
  - **Portfolio**: Apre la pagina di navigazione dei progetti
  - **Contatti**: Apre il modulo di contatto
  - **Accedi/Registrati**: Accesso alle pagine di autenticazione (quando non sei connesso)
  - **Nome Utente**: Accesso al tuo profilo (quando sei connesso)
  - **Dashboard Amministratore**: Disponibile solo per gli amministratori
  - **Selettore Lingua**: Cambia la lingua dell'interfaccia

- **Area Contenuto Principale**: La parte centrale della pagina che mostra contenuti diversi in base alla sezione selezionata.

- **Barra Laterale**: Può apparire su determinate pagine, fornendo opzioni di navigazione aggiuntive o filtri.

- **Piè di Pagina**: Situato nella parte inferiore di ogni pagina, contenente:
  - Informazioni sul copyright
  - Collegamenti ai Termini di Servizio e all'Informativa sulla Privacy
  - Collegamenti ai social media
  - Informazioni aggiuntive sull'azienda

- **Pulsante Chat Fisso**: Un pulsante circolare nell'angolo in basso a destra che ti permette di iniziare un contatto con lo studio da qualsiasi pagina.

- **Navigazione a Breadcrumb**: Nelle pagine interne, mostra la tua posizione attuale all'interno della gerarchia del sito.

**Navigazione da Tastiera**: Puoi navigare nel sito utilizzando scorciatoie da tastiera:
- Tab: Sposta tra elementi interattivi
- Invio: Attiva pulsanti o collegamenti selezionati
- Esc: Chiudi finestre di dialogo o popup
- Tasti freccia: Naviga elementi carosello o menu a discesa

## Funzionalità Utente

### Navigazione Progetti

La pagina Portfolio è il centro principale per esplorare i progetti architettonici. Ecco come navigare e sfogliare efficacemente:

1. Naviga alla pagina "Portfolio" cliccando sul link nella barra di navigazione in alto o andando direttamente a `portfolios.html`.

2. **Navigazione Carosello Progetti**:
   - I progetti principali in evidenza appaiono in formato carosello nella parte superiore della pagina.
   - Utilizza i pulsanti freccia a sinistra e a destra del carosello per navigare tra i progetti.
   - Sui dispositivi touch, puoi scorrere a sinistra o a destra per navigare.
   - Il carosello ruota automaticamente ogni 8 secondi, ma si ferma quando ci passi sopra con il mouse o interagisci con esso.

3. **Vista a Griglia dei Progetti**:
   - Sotto il carosello, i progetti sono visualizzati in formato griglia.
   - Ogni scheda progetto contiene:
     - Immagine miniatura del progetto
     - Titolo del progetto
     - Etichetta categoria
     - Indicatore di stato (Completato, In Corso o Non Completato)
     - Breve descrizione (se disponibile)
   - La griglia si adatta automaticamente in base alla dimensione dello schermo (4 colonne su schermi grandi, 2-3 su schermi medi, 1 su mobile).

4. **Paginazione**:
   - Se ci sono più progetti di quanti ne possano entrare in una pagina, i controlli di paginazione appaiono in basso.
   - Clicca sui numeri per saltare a pagine specifiche.
   - Usa i pulsanti "Precedente" e "Successivo" per spostarti tra pagine adiacenti.
   - La pagina corrente è evidenziata nei controlli di paginazione.

5. **Modalità di Visualizzazione**:
   - Alterna tra "Vista a Griglia" e "Vista a Lista" utilizzando i pulsanti nell'angolo in alto a destra della sezione progetti.
   - Vista a Griglia: Mostra i progetti in un layout a piastrelle con enfasi sulle immagini.
   - Vista a Lista: Mostra i progetti in un formato più dettagliato con informazioni testuali aggiuntive.

6. **Opzioni di Ordinamento**:
   - Clicca sul menu a discesa "Ordina per" per disporre i progetti secondo:
     - Più Recenti Prima (predefinito)
     - Più Vecchi Prima
     - Alfabetico (A-Z)
     - Alfabetico Inverso (Z-A)
     - Stato (Completati prima)

**Suggerimento sulle Prestazioni**: Le immagini si caricano progressivamente mentre scorri la pagina per ottimizzare le prestazioni. Se hai una connessione più lenta, potresti notare che le immagini si caricano con un leggero ritardo.

### Visualizzazione Dettagli Progetto

Quando trovi un progetto di interesse, puoi accedere a informazioni dettagliate:

1. Clicca su qualsiasi scheda o miniatura di progetto per aprire la sua vista dettagliata.

2. **Pannello Informazioni Progetto**:
   - **Sezione Intestazione**:
     - Titolo del progetto in caratteri grandi
     - Indicatori di categoria e stato
     - Data di aggiunta/completamento (se disponibile)
   
   - **Sezione Descrizione**:
     - Descrizione dettagliata del progetto
     - Caratteristiche chiave ed evidenziazioni
     - Toggle "Mostra Più/Meno" per descrizioni più lunghe
   
   - **Sezione Metadati**:
     - Specifiche tecniche
     - Membri del team (se disponibile)
     - Informazioni sulla tempistica
     - Dettagli sulla posizione (se applicabile)

3. **Navigazione all'interno dei Dettagli del Progetto**:
   - Utilizza le schede vicino alla parte superiore della pagina per passare tra diverse sezioni di contenuto:
     - Panoramica (predefinito)
     - Documenti
     - Immagini
     - Video (se disponibili)
     - Specifiche
   
4. **Ritorno all'Elenco Progetti**:
   - Clicca sul pulsante "Torna ai Progetti" nell'angolo in alto a sinistra
   - Usa il pulsante indietro del browser
   - Clicca su "Portfolio" nella barra di navigazione

5. **Progetti Correlati**:
   - Nella parte inferiore della pagina dei dettagli del progetto, troverai progetti correlati suggeriti.
   - Questi sono basati su categorie, tecniche o stili simili.
   - Clicca su qualsiasi miniatura di progetto correlato per navigare ai suoi dettagli.

**Funzione di Accessibilità**: Tutte le pagine di dettaglio dei progetti supportano la navigazione da tastiera, screen reader e modalità di visualizzazione ad alto contrasto per utenti con disabilità.

### Visualizzatore Documenti

Per progetti che includono file di documenti (PDF, PowerPoint, ecc.), il visualizzatore di documenti integrato fornisce queste capacità:

1. **Apertura del Visualizzatore Documenti**:
   - Naviga alla pagina dei dettagli di un progetto
   - Clicca sulla scheda "Documenti"
   - Seleziona il documento che vuoi visualizzare dall'elenco

2. **Controlli del Visualizzatore Documenti**:
   - Il documento si apre in un'interfaccia flipbook alimentata da Turn.js, simulando un libro o documento fisico
   
   - **Controlli di Navigazione**:
     - Clicca sul bordo destro della pagina per andare avanti
     - Clicca sul bordo sinistro per andare indietro
     - Usa i pulsanti freccia in basso per la navigazione
     - Inserisci un numero di pagina specifico nella casella di input della pagina
   
   - **Controlli di Visualizzazione**:
     - Zoom In (+): Ingrandisci il documento
     - Zoom Out (-): Riduci la dimensione del documento
     - Adatta alla Larghezza: Adatta il documento alla larghezza della finestra
     - Adatta alla Pagina: Mostra l'intera pagina nel visualizzatore
     - Schermo Intero: Attiva/disattiva la modalità a schermo intero (premi Esc per uscire)
   
   - **Opzioni Aggiuntive**:
     - Scarica: Salva il documento sul tuo dispositivo
     - Stampa: Invia il documento alla tua stampante
     - Condividi: Genera un link diretto al documento (se abilitato)

3. **Navigazione Multi-Pagina**:
   - La striscia di miniature in basso mostra l'anteprima del documento
   - Clicca su qualsiasi miniatura per saltare a quella pagina
   - Usa le frecce di scorrimento per sfogliare le miniature

4. **Elementi Interattivi**:
   - Indice cliccabile (per documenti supportati)
   - I collegamenti ipertestuali all'interno dei documenti rimangono funzionali
   - Funzione di ricerca per trovare testo specifico (per documenti basati su testo)

**Nota sulle Prestazioni**: I documenti di grandi dimensioni potrebbero richiedere un momento per caricarsi completamente, specialmente su connessioni più lente. Un indicatore di caricamento verrà visualizzato mentre il documento si prepara.

---

© 2025 Portfolio di Architettura LGC. Tutti i diritti riservati. 