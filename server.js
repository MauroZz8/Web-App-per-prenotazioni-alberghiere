const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path'); // Aggiunto per utilizzare il modulo 'path'

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = 'mongodb://localhost:27017/HotelDB';

const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connesso al database MongoDB');
    } catch (error) {
        console.error('Errore durante la connessione al database:', error);
    }
}

connectToDatabase();

// Gestione delle richieste GET per index.html
app.get('/index.html', (req, res) => {
    // Imposta l'intestazione Content-Type prima di inviare la risposta
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');

    // Invia il contenuto di index.html come risposta
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Middleware per il parsing del corpo delle richieste
app.use(express.json());

// Middleware per abilitare le richieste CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Consenti a qualsiasi dominio di accedere alle risorse
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Aggiungi OPTIONS come metodo consentito
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Verifica se è una richiesta preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200); // Rispondi con OK se è una richiesta preflight
    }

    next();
});

// Endpoint per ottenere le camere disponibili
app.get('/camere_disponibili', async (req, res) => {
    const camereDisponibiliCollection = client.db().collection('camere_disponibili');

    try {
        const camereDisponibili = await camereDisponibiliCollection.find({}).toArray();
        res.json(camereDisponibili);
    } catch (error) {
        console.error('Errore durante il recupero delle camere disponibili:', error);
        res.status(500).json({ message: 'Si è verificato un errore durante il recupero delle camere disponibili' });
    }
});

// Gestione delle richieste per la prenotazione delle camere
app.post('/prenotazioni_camere', async (req, res) => {
    const newBooking = req.body;
    const bookingsCollection = client.db().collection('prenotazioni_camere');

    try {
        // Verifica la disponibilità della camera per le date desiderate
        const isRoomAvailable = await verificaDisponibilitaCamera(newBooking.roomId, newBooking.checkInDate, newBooking.checkOutDate);

        if (!isRoomAvailable) {
            return res.status(400).json({ message: 'La camera non è disponibile per le date selezionate' });
        }

        // Effettua l'inserimento della prenotazione nella collezione prenotazioni_camere
        const result = await bookingsCollection.insertOne(newBooking);

        // Aggiorna lo stato della camera nel database a "non disponibile"
        const roomsCollection = client.db().collection('camere_disponibili');
        await roomsCollection.updateOne({ _id: newBooking.roomId }, { $set: { disponibile: false } });

        res.status(201).json({ message: 'Prenotazione effettuata con successo', insertedId: result.insertedId });
    } catch (error) {
        console.error('Errore durante la prenotazione della camera:', error);
        res.status(500).json({ message: 'Si è verificato un errore durante la prenotazione della camera' });
    }
});

// Funzione per verificare la disponibilità della camera per le date desiderate
async function verificaDisponibilitaCamera(roomId, checkInDate, checkOutDate) {
    try {
        const bookingsCollection = client.db().collection('prenotazioni_camere');

        // Verifica se esiste già una prenotazione che si sovrappone alle date desiderate per la stessa camera
        const existingBooking = await bookingsCollection.findOne({
            roomId: roomId,
            $or: [
                { checkInDate: { $lte: checkInDate }, checkOutDate: { $gte: checkInDate } },
                { checkInDate: { $lte: checkOutDate }, checkOutDate: { $gte: checkOutDate } }
            ]
        });

        return !existingBooking; // Restituisci true se la camera è disponibile, altrimenti false
    } catch (error) {
        console.error('Errore durante la verifica della disponibilità della camera:', error);
        return false; // Gestisci l'errore restituendo false
    }
}
// Gestione delle richieste per la cancellazione delle prenotazioni
app.delete('/prenotazioni_camere/:id', async (req, res) => {
    const prenotazioneId = req.params.id;
    const bookingsCollection = client.db().collection('prenotazioni_camere');

    try {
        // Cerca e cancella la prenotazione utilizzando l'ID fornito
        const result = await bookingsCollection.deleteOne({ _id: new ObjectId(prenotazioneId) });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Prenotazione cancellata con successo' });
        } else {
            res.status(404).json({ message: 'Prenotazione non trovata' });
        }
    } catch (error) {
        console.error('Errore durante la cancellazione della prenotazione:', error);
        res.status(500).json({ message: 'Si è verificato un errore durante la cancellazione della prenotazione' });
    }
});


// Endpoint per la registrazione degli utenti
app.post('/registrazioni_utenti', async (req, res) => {
    const userData = req.body; // Dati inviati dal frontend

    try {
        const db = client.db();
        const usersCollection = db.collection('registrazioni_utenti');

        // Inserisci i dati dell'utente nel database
        const result = await usersCollection.insertOne(userData);

        // Invia una risposta di successo
        res.status(201).json({ message: 'Registrazione utente effettuata con successo', insertedId: result.insertedId });
    } catch (error) {
        console.error('Errore durante la registrazione utente:', error);
        res.status(500).json({ message: 'Si è verificato un errore durante la registrazione utente' });
    }
});


// Avvio del server
app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});
