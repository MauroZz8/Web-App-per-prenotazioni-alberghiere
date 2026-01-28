// Gestione dell'invio del modulo di prenotazione
document.getElementById('bookingForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const bookingData = {
        roomId: formData.get('roomId'),
        userID: generateUserID(), // Aggiungi un campo userID con un valore generato automaticamente
        checkInDate: formData.get('checkInDate'),
        checkOutDate: formData.get('checkOutDate'),
        firstName: formData.get('nome'), // Aggiorna il nome del campo per corrispondere al campo HTML
        lastName: formData.get('cognome'), // Aggiorna il nome del campo per corrispondere al campo HTML
        email: formData.get('email'), // Aggiungi l'indirizzo email
        city: formData.get('citta'), // Aggiungi la città di provenienza
        birthdate: formData.get('dataNascita') // Aggiungi la data di nascita
    };

    try {
        // Invia la richiesta di prenotazione della camera al backend
        const response = await axios.post('http://localhost:3000/prenotazioni_camere', bookingData);
        console.log('Prenotazione effettuata con successo:', response.data);
        const bookingId = response.data.insertedId;
        document.getElementById('bookingId').textContent = bookingId;
        document.getElementById('bookingConfirmation').style.display = 'block';
    } catch (error) {
        console.error('Errore durante la prenotazione della camera:', error);
        alert('Si è verificato un errore durante la prenotazione della camera.');
    }
});

// Funzione per generare un ID utente casuale
function generateUserID() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Funzione per gestire la cancellazione della prenotazione
async function handleCancellationFormSubmit(event) {
    event.preventDefault(); // Evita il comportamento predefinito del modulo (ad esempio, il refresh della pagina)

    const cancellationForm = document.getElementById('cancelBookingForm');
    const bookingId = cancellationForm.elements['cancelBookingId'].value; // Ottiene l'ID della prenotazione dalla casella di input

    try {
        const response = await axios.delete(`http://localhost:3000/prenotazioni_camere/${bookingId}`);
        console.log('Prenotazione cancellata con successo:', response.data);
        alert('Prenotazione cancellata con successo!');
    } catch (error) {
        console.error('Errore durante la cancellazione della prenotazione:', error);
        alert('Si è verificato un errore durante la cancellazione della prenotazione.');
    }
}

// Associa la funzione di gestione della cancellazione al modulo di cancellazione
const cancellationForm = document.getElementById('cancelBookingForm');
cancellationForm.addEventListener('submit', handleCancellationFormSubmit);

// Funzione per verificare la disponibilità della camera per le date desiderate
async function verificaDisponibilitaCamera(roomId, checkInDate, checkOutDate) {
    try {
        const response = await axios.post('http://localhost:3000/prenotazioni_camere', {
            roomId: roomId,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate
        });

        return response.data.disponibile;
    } catch (error) {
        console.error('Errore durante la verifica della disponibilità della camera:', error);
        return false; // Gestisci l'errore restituendo false
    }
}

// Funzione per gestire il click sul pulsante di prenotazione
async function prenotaCamera(roomId) {
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;

    // Verifica la disponibilità della camera per le date desiderate
    const isRoomAvailable = await verificaDisponibilitaCamera(roomId, checkInDate, checkOutDate);

    if (isRoomAvailable) {
        // La camera è disponibile, procedi con la prenotazione
        try {
            const response = await axios.post('http://localhost:3000/prenotazioni_camere', {
                roomId: roomId,
                checkInDate: checkInDate,
                checkOutDate: checkOutDate
            });
            console.log('Prenotazione effettuata con successo:', response.data);
            const bookingId = response.data.insertedId;
            document.getElementById('bookingId').textContent = bookingId;
            document.getElementById('bookingConfirmation').style.display = 'block';
        } catch (error) {
            console.error('Errore durante la prenotazione della camera:', error);
            alert('Si è verificato un errore durante la prenotazione della camera.');
        }
    } else {
        // La camera non è disponibile, mostra un messaggio all'utente
        console.log('La camera non è disponibile per le date selezionate.');
        // Aggiorna l'interfaccia utente per informare l'utente sulla non disponibilità della camera
    }
}

// Chiamata alla funzione per ottenere le camere disponibili al caricamento della pagina
window.onload = function () {
    getAvailableRooms();
    handleRegistration(); // Chiamata alla funzione per gestire la registrazione utente
};
