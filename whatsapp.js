const { Client, LocalAuth } = require('whatsapp-web.js');
const qrCode = require('qrcode');

let sessions = {};

function createNewSession(emitToAllClientsSession, nameSession) {

    let client = new Client({
        authStrategy: new LocalAuth({
            clientId: nameSession
        })
    });

    client.on('qr', (qr) => {
        qrCode.toDataURL(qr, { errorCorrectionLevel: 'H' }, (err, url) => {
            if (err) throw err;
          
            // Converte a imagem do QR code em base64
            const base64Image = "data:image/png;base64," + url.split(',')[1];
          
            emitToAllClientsSession(nameSession, 'QrCodeBase64', base64Image);
        });
    });
    
    client.on('ready', () => {
        console.log('Client is ready!');
        emitToAllClientsSession(nameSession, 'StatusQrCodeBase64', 'successChat');
        sessions[nameSession] = client;
    });

    client.on('change_state', (state) => {
        console.log('status mudou', state);
    });
    
    
    client.initialize();
}

function createOldSession(nameSession) {

    return new Promise((resolve, reject) => {
        let client = new Client({
            authStrategy: new LocalAuth({
                clientId: nameSession
            })
        });
    
    
        client.on('ready', () => {
            console.log('Client is ready!');
            sessions[nameSession] = client;
            resolve(client);
        });
    
        client.on('change_state', (state) => {
            console.log('status mudou', state);
        });

        client.on('message', (msg) => {
            console.log('nova mensagem');
            console.log(msg);
        });
        
        
        client.initialize();
    });
}


function getAllClients() {
    return sessions;
}

function getClient(session) {
    if(sessions.hasOwnProperty(session)){
        return sessions[session];
    }

    return undefined;
}

module.exports = { createOldSession, createNewSession, getClient, getAllClients }