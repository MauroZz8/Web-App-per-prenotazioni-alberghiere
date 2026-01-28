// Funzione per ottenere le camere disponibili dal backend e popolare il menu a discesa
async function getAvailableRooms() {
    try {
        const response = await axios.get('http://localhost:3000/camere_disponibili');
        const availableRooms = response.data;

        const roomDropdown = document.getElementById('roomId');
        roomDropdown.innerHTML = '<option value="">Seleziona una camera</option>';

        availableRooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room._id; // Assumendo che l'ID della camera sia disponibile come _id nel documento
            option.textContent = `Camera ${room.numero_camera} - ${room.tipo} - Prezzo In Euro: ${room.prezzo}`;
            roomDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Errore durante il recupero delle camere disponibili:', error);
    }
}

// Funzione per verificare la disponibilità della camera per le date desiderate
async function verificaDisponibilitaCamera(roomId, checkInDate, checkOutDate) {
    try {
        const response = await axios.post('http://localhost:3000/verifica_disponibilita', {
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

// Funzione per gestire la registrazione utente
async function handleRegistration() {
    const registrationForm = document.getElementById('registrationForm');
    registrationForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita il comportamento predefinito del modulo (ad esempio, il refresh della pagina)

        // Ottenere i dati dal modulo di registrazione utente
        const formData = new FormData(registrationForm);
        const registrationData = {};
        formData.forEach((value, key) => {
            registrationData[key] = value;
        });

        try {
            // Invia i dati al backend per la registrazione utente
            const response = await axios.post('http://localhost:3000/registrazioni_utenti', registrationData);
            alert('Registrazione utente effettuata con successo!');
            // Potresti aggiungere qui altre azioni dopo una registrazione utente riuscita
        } catch (error) {
            alert('Si è verificato un errore durante la registrazione utente.');
            console.error('Errore durante la registrazione utente:', error);
        }
    });
}

// Funzione per gestire la cancellazione della prenotazione
async function cancellaPrenotazione() {
    const prenotazioneId = document.getElementById('bookingId').value;

    try {
        const response = await axios.delete(`http://localhost:3000/prenotazioni_camere/${prenotazioneId}`);
        console.log('Prenotazione cancellata con successo:', response.data);
        alert('Prenotazione cancellata con successo!');
        // Aggiorna l'interfaccia o esegui altre azioni necessarie dopo la cancellazione
    } catch (error) {
        console.error('Errore durante la cancellazione della prenotazione:', error);
        alert('Si è verificato un errore durante la cancellazione della prenotazione.');
    }
}

// Chiamata alla funzione per ottenere le camere disponibili al caricamento della pagina
window.onload = function () {
    getAvailableRooms();
    handleRegistration(); // Chiamata alla funzione per gestire la registrazione utente
};

// Associa la funzione di cancellazione alla pressione del pulsante Cancella Prenotazione
document.getElementById('cancelBookingButton').addEventListener('click', cancellaPrenotazione);
