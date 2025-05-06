# Guida Supabase per Principianti Assoluti - Portfolio di Architettura LGC

## Indice
1. [Che Cos'è Supabase?](#che-cosè-supabase)
2. [Accesso a Supabase](#accesso-a-supabase)
3. [Orientarsi nell'Interfaccia](#orientarsi-nellinterfaccia)
4. [Dove Sono Archiviati i Tuoi Dati](#dove-sono-archiviati-i-tuoi-dati)
5. [Gestione degli Utenti](#gestione-degli-utenti)
6. [Gestione dei File](#gestione-dei-file)
7. [Gli Aspetti di Programmazione](#gli-aspetti-di-programmazione)
8. [Verificare il Funzionamento](#verificare-il-funzionamento)
9. [Mantenere Tutto Sicuro](#mantenere-tutto-sicuro)
10. [Quando Qualcosa si Rompe](#quando-qualcosa-si-rompe)

## Che Cos'è Supabase?

Supabase è sostanzialmente il motore che funziona dietro le quinte del sito web Portfolio di Architettura LGC. Pensalo come lo staff dietro le quinte di un concerto - non li vedi, ma fanno funzionare tutto.

Ecco cosa fa in termini semplici:

- **Archivia tutte le informazioni**: Come un archivio super-organizzato per tutti i dettagli dei progetti, le informazioni degli utenti e le impostazioni
- **Gestisce gli account utente**: Tiene traccia di chi può accedere e cosa è autorizzato a vedere
- **Archivia tutti i file**: Mantiene al sicuro e organizzati tutti i PDF, i video e le immagini
- **Collega tutto insieme**: Assicura che il sito web possa accedere a tutti questi elementi quando necessario
- **Rende le cose istantanee**: Aggiorna le informazioni in tempo reale quando vengono apportate modifiche

La cosa interessante di Supabase è che fa automaticamente tutte queste cose complicate, così non dobbiamo costruirle noi stessi o gestire server fisici. È come avere un assistente virtuale che gestisce tutte le noiose questioni tecniche.

## Accesso a Supabase

### Dettagli di Accesso

Per accedere al pannello di controllo Supabase per il Portfolio di Architettura LGC:

1. Vai su https://app.supabase.io/
2. Accedi con questi dettagli:
   - **Email**: admin@lgc.achi (usa l'email dell'amministratore reale che ti è stata fornita)
   - **Password**: Chiedi a chi ha configurato il sistema la password

### Trovare il Tuo Progetto

Dopo aver effettuato l'accesso:

1. Vedrai un elenco di progetti collegati al tuo account
2. Clicca su quello chiamato **Portfolio di Architettura LGC**
3. Ti porterà al pannello di controllo principale

**Informazioni Importanti sulla Sicurezza**: Non condividere mai questi dettagli di accesso con nessuno. Non scriverli nelle email o metterli su post-it sul tuo monitor. Questi dettagli di accesso sono come le chiavi del regno - danno accesso a tutti i dati privati.

## Orientarsi nell'Interfaccia

Il pannello di controllo di Supabase potrebbe sembrare complicato all'inizio, ma è solo organizzato in diverse sezioni:

### Menu Laterale

- **Home**: Mostra una panoramica di tutto
- **Editor Tabelle**: Dove puoi visualizzare e modificare le informazioni archiviate nel sistema
- **Autenticazione**: Dove vengono gestiti gli account utente
- **Archiviazione**: Dove sono conservati tutti i file
- **Funzioni Edge**: Cose automatizzate sofisticate (probabilmente non avrai bisogno di toccarle)
- **Database**: Impostazioni avanzate per l'archiviazione delle informazioni
- **Impostazioni Progetto**: Impostazioni generali per l'intero sistema
- **Documentazione API**: Istruzioni per i programmatori (puoi ignorare questa sezione a meno che non stia programmando)

### Area Principale

La parte centrale dello schermo mostra qualsiasi sezione tu abbia selezionato dal menu laterale. Questo è dove effettivamente farai le cose.

### Statistiche in Alto

La pagina principale mostra alcuni numeri di base su come sta funzionando il sistema:

- Quanti utenti sono registrati
- Quanto è occupato il sistema
- Quanto spazio di archiviazione viene utilizzato
- Come sta funzionando il database

## Dove Sono Archiviati i Tuoi Dati

Il Portfolio di Architettura LGC mantiene tutte le sue informazioni in "tabelle" organizzate (pensale come fogli di calcolo):

### Tabella Utenti

Questa tiene traccia di tutti coloro che possono accedere:

| Colonna | Cos'è | Descrizione |
|--------|------------|-------------|
| id | Codice ID unico | Un codice casuale che identifica ogni utente |
| username | Nome utente | Ciò che le persone digitano per accedere |
| password | Password | Criptata per sicurezza (mai memorizzata in testo semplice) |
| is_admin | Interruttore admin | Determina se l'utente ha poteri speciali |
| created_at | Data di creazione | Quando è stato creato l'account |

### Tabella Progetti

Questa memorizza tutti i progetti di architettura:

| Colonna | Cos'è | Descrizione |
|--------|------------|-------------|
| id | Codice ID unico | Un codice casuale che identifica ogni progetto |
| title | Titolo del progetto | Il nome del progetto |
| category | Categoria | Che tipo di progetto è |
| status | Stato | In Corso, Completato o Non Completato |
| description | Descrizione | Dettagli sul progetto |
| file_path | Posizione file | Dove è archiviato il documento principale |
| image_path | Posizione immagine | Dove è archiviata l'immagine di copertina |
| content_type | Tipo di contenuto | Se è un documento o un video |
| created_at | Data di creazione | Quando è stato aggiunto il progetto |
| created_by | ID creatore | Quale utente ha aggiunto il progetto |

### Tabella Project_Client

Questa collega i progetti ai clienti a cui appartengono:

| Colonna | Cos'è | Descrizione |
|--------|------------|-------------|
| id | Codice ID unico | Un codice casuale per ogni connessione |
| project_id | ID progetto | Di quale progetto si tratta |
| user_id | ID cliente | Per quale cliente è |
| access_level | Livello di accesso | Cosa è consentito fare al cliente con il progetto |

### Visualizzare e Modificare le Informazioni

Per visualizzare o modificare le informazioni:

1. Clicca su **Editor Tabelle** nel menu laterale
2. Scegli quale tabella vuoi guardare
3. Puoi:
   - Guardare ciò che è già presente
   - Aggiungere nuove informazioni cliccando su "Inserisci Riga"
   - Modificare le informazioni esistenti cliccando su qualsiasi cella
   - Eliminare cose selezionandole e cliccando su "Elimina"

### Fare Ricerche Più Complesse

Se hai bisogno di trovare informazioni specifiche:

1. Clicca su **Editor SQL** nel menu laterale
2. Clicca su "Nuova Query"
3. Digita un comando di ricerca, come:
   ```
   SELECT p.title, p.status, u.username 
   FROM projects p
   JOIN users u ON p.created_by = u.id
   WHERE p.status = 'In Corso';
   ```
   (Questo troverebbe tutti i progetti attualmente in corso e mostrerebbe chi li ha creati)
4. Clicca su "Esegui" per vedere i risultati

Non preoccuparti se sembra complicato - probabilmente non avrai bisogno di usarlo a meno che non stia cercando qualcosa di molto specifico.

## Gestione degli Utenti

Il sistema tiene traccia di chi può accedere e cosa può fare:

### Visualizzare gli Account Utente

1. Clicca su **Autenticazione** nel menu laterale
2. Seleziona **Utenti** per vedere tutti coloro che possono accedere
3. Vedrai cose come:
   - Il loro nome utente/email
   - Quando si sono registrati
   - Quando hanno effettuato l'ultimo accesso
   - Se il loro account è attivo

### Gestire gli Account Utente

Come amministratore, puoi:

1. **Creare nuovi account**:
   - Clicca su "Aggiungi Utente"
   - Compila i loro dettagli
   - Imposta la loro password iniziale

2. **Modificare account esistenti**:
   - Clicca sull'utente che vuoi modificare
   - Apporta le tue modifiche
   - Salvale

3. **Attivare o disattivare account**:
   - Seleziona l'utente
   - Clicca su "Disabilita" o "Abilita" come necessario

4. **Reimpostare le password**:
   - Seleziona l'utente
   - Clicca su "Reimposta Password"
   - Riceveranno istruzioni per creare una nuova password

### Impostazioni Utente

Per modificare le impostazioni generali sul funzionamento degli account:

1. Clicca su **Autenticazione** nel menu laterale
2. Seleziona **Impostazioni**
3. Puoi modificare cose come:
   - Come le persone possono accedere
   - Regole per le password
   - Come funzionano i reset delle password
   - Dove vanno le persone dopo l'accesso
   - Per quanto tempo rimangono connesse

## Gestione dei File

Supabase ha un sistema di archiviazione file che è come un Google Drive super potenziato per tutti i documenti, video e immagini dei progetti:

### Come Sono Organizzati i File

I file sono archiviati in diversi "bucket" (pensali come cartelle principali):

- **project_files**: Dove risiedono i documenti principali dei progetti
- **project_images**: Dove sono archiviate le immagini e le miniature dei progetti
- **project_videos**: Dove sono conservati i file video
- **temp_uploads**: Archiviazione temporanea durante i caricamenti dei file

### Accesso ai File

1. Clicca su **Archiviazione** nel menu laterale
2. Scegli in quale bucket vuoi guardare
3. Vedrai tutti i file organizzati in cartelle

### Gestione dei File

Come amministratore, puoi:

1. **Caricare file**:
   - Vai al bucket e alla cartella che desideri
   - Clicca su "Carica"
   - Scegli un file dal tuo computer
   - Conferma il caricamento

2. **Visualizzare file**:
   - Clicca sul nome del file per vederlo
   - Le immagini mostreranno un'anteprima
   - Per altri file, puoi scaricarli per visualizzarli

3. **Organizzare file**:
   - Crea nuove cartelle cliccando su "Nuova Cartella"
   - Sposta file tra cartelle trascinandoli
   - Rinomina file cliccando sull'icona di modifica

4. **Eliminare file**:
   - Seleziona il file che vuoi rimuovere
   - Clicca su "Elimina"
   - Conferma che vuoi davvero eliminarlo

### Regole di Accesso ai File

Puoi controllare chi può vedere o modificare quali file:

1. Clicca su **Archiviazione** nel menu laterale
2. Seleziona **Politiche**
3. Puoi visualizzare e modificare le regole esistenti per ogni bucket
4. Per creare una nuova regola:
   - Clicca su "Aggiungi Politica"
   - Imposta i permessi (lettura, scrittura, eliminazione)
   - Specifica chi può fare queste cose
   - Salva la nuova regola

## Gli Aspetti di Programmazione

Supabase crea automaticamente modi per far comunicare il sito web con tutti questi dati. Questa parte diventa tecnica, ma ecco la versione semplice:

### Chiavi API

Ci sono due "chiavi" principali che permettono al sito web di accedere ai dati:

1. **Chiave pubblica** (chiave `anon`):
   - Usata per le cose degli utenti normali
   - Incorporata nel codice del sito web
   
2. **Chiave di servizio** (chiave `service_role`):
   - Chiave di amministratore super potente
   - Deve essere mantenuta segreta e mai inserita nel codice del sito web

Per trovare queste chiavi:

1. Clicca su **Impostazioni Progetto** nel menu laterale
2. Seleziona **API**
3. Le chiavi saranno mostrate nella sezione "Chiavi API del progetto"

### Consultare la Documentazione API

Per vedere come il sito web può utilizzare questi dati:

1. Clicca su **Documentazione API** nel menu laterale
2. Scegli la tabella o la funzionalità che ti interessa
3. Vedrai esempi di codice per diverse operazioni come:
   - Ottenere dati
   - Aggiungere nuovi record
   - Aggiornare informazioni
   - Eliminare dati

### Esempi di Codice

Ecco alcuni esempi semplificati di come il codice del sito web comunica con Supabase:

#### Configurazione della Connessione

```javascript
const supabaseUrl = 'https://pwsgmskiamkpzgtlaikm.supabase.co';
const supabaseKey = 'la-tua-chiave-pubblica';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);
```

#### Ottenere Tutti i Progetti

```javascript
async function getProjects() {
  const { data, error } = await supabase
    .from('Projects')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Errore nel recupero dei progetti:', error);
    return [];
  }
  
  return data;
}
```

#### Accesso degli Utenti

```javascript
async function loginUser(username, password) {
  // Esempio semplificato
  const { data, error } = await supabase
    .from('Users')
    .select('*')
    .eq('username', username)
    .single();
    
  if (error || !data) {
    return { success: false, error: 'Utente non trovato' };
  }
  
  if (data.password === password) {
    return { success: true, user: data };
  } else {
    return { success: false, error: 'Password errata' };
  }
}
```

Non preoccuparti se questo sembra incomprensibile - gli sviluppatori web gestiscono questa parte. Non è necessario capire il codice per utilizzare il sistema.

## Verificare il Funzionamento

Tenere d'occhio come sta funzionando il sistema aiuta a individuare i problemi in anticipo:

### Visualizzare i Log delle Richieste

Per vedere cosa sta accadendo con il sistema:

1. Clicca su **Database** nel menu laterale
2. Seleziona **Log**
3. Scegli "API" nella scheda in alto
4. Vedrai un elenco di tutte le attività recenti, inclusi:
   - Quando sono avvenute
   - Che tipo di richiesta era
   - Quale parte del sistema è stata utilizzata
   - Se ha funzionato o no
   - Quanto tempo ha richiesto

### Monitorare le Prestazioni del Database

Per controllare quanto bene sta funzionando il database:

1. Clicca su **Database** nel menu laterale
2. Seleziona **Prestazioni**
3. Puoi vedere cose come:
   - Utilizzo della CPU
   - Utilizzo della memoria
   - Attività di lettura/scrittura
   - Query lente

### Configurare Avvisi

Puoi ricevere notifiche quando qualcosa non va:

1. Clicca su **Impostazioni Progetto** nel menu laterale
2. Seleziona **Notifiche**
3. Configura avvisi per cose come:
   - Elevato utilizzo delle risorse
   - Problemi di sicurezza
   - Avvicinamento ai limiti di utilizzo

## Mantenere Tutto Sicuro

### Backup del Database

Supabase crea automaticamente backup del tuo database:

1. Clicca su **Database** nel menu laterale
2. Seleziona **Backup**
3. Vedrai un elenco dei backup disponibili
4. Per ripristinare da un backup:
   - Scegli il backup che desideri
   - Clicca su "Ripristina"
   - Conferma l'azione

**Importante**: Il ripristino di un backup sostituirà completamente il database attuale. Fallo solo in caso di emergenza!

### Sicurezza e Impostazioni Avanzate

Per impostazioni di sicurezza più avanzate:

1. Clicca su **Impostazioni Progetto** nel menu laterale
2. Esplora le sezioni:
   - **Generale**: Impostazioni di base del progetto
   - **Database**: Impostazioni del database
   - **API**: Gestione delle chiavi API e impostazioni
   - **Autenticazione**: Impostazioni di accesso avanzate

### Politiche di Sicurezza (RLS)

Supabase utilizza la "Sicurezza a Livello di Riga" per controllare chi può vedere o modificare cosa:

1. Clicca su **Autenticazione** nel menu laterale
2. Seleziona **Politiche**
3. Qui puoi creare e gestire regole per ogni tabella:
   - Definire chi può leggere quali record
   - Controllare chi può aggiungere nuovi dati
   - Limitare chi può aggiornare o eliminare informazioni

## Quando Qualcosa si Rompe

### Problemi Comuni e Soluzioni

#### 1. Problemi di Accesso

**Problema**: Gli utenti non riescono ad accedere.

**Soluzioni**:
- Controlla che il nome utente e la password siano corretti
- Assicurati che l'account non sia disabilitato nel pannello di Autenticazione
- Verifica che le impostazioni di autenticazione siano corrette
- Testa la connessione a Supabase nel front-end

#### 2. Errori API

**Problema**: Il sito web non si collega correttamente ai dati.

**Soluzioni**:
- Controlla che la chiave API sia corretta
- Assicurati che le impostazioni dei permessi siano configurate correttamente
- Guarda i log API per trovare il problema specifico
- Testa la query direttamente nell'Editor SQL

#### 3. Problemi di Archiviazione File

**Problema**: Gli utenti non possono caricare o visualizzare i file.

**Soluzioni**:
- Controlla le politiche di accesso all'Archiviazione
- Assicurati che il bucket esista e sia accessibile
- Verifica che la dimensione del file non sia troppo grande
- Testa il caricamento manualmente attraverso la dashboard

#### 4. Prestazioni Lente

**Problema**: Le cose funzionano troppo lentamente.

**Soluzioni**:
- Controlla le prestazioni del database nel pannello Database
- Ottimizza query complesse
- Considera l'aggiunta di indici a colonne frequentemente cercate
- Monitora l'utilizzo delle risorse nel pannello Progetto

### Ottenere Più Aiuto

Se incontri problemi che non riesci a risolvere:

1. **Documentazione Supabase**:
   - Visita https://supabase.com/docs per l'aiuto ufficiale

2. **Supporto della Comunità**:
   - GitHub: https://github.com/supabase/supabase/discussions
   - Discord: https://discord.supabase.com

3. **Supporto Diretto** (per piani a pagamento):
   - Contatta attraverso il portale di supporto Supabase

## Conclusione

Questa guida ti fornisce le basi su come accedere e gestire Supabase per il Portfolio di Architettura LGC. Può sembrare complicato all'inizio, ma non è necessario comprendere ogni dettaglio per apportare modifiche di base.

Ricorda che Supabase contiene tutti i dati importanti per l'applicazione. Fai sempre backup prima di apportare modifiche importanti e testa attentamente le cose prima di applicarle al sistema live.

Se mai sei insicuro su qualcosa, è meglio chiedere aiuto piuttosto che sperimentare con impostazioni che non comprendi.

---

© 2025 Portfolio di Architettura LGC. Tutti i diritti riservati. 