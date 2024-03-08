const { Client, LocalAuth } = require('whatsapp-web.js');
const qrCode = require('qrcode');
const { deleteTokenResultados } = require('./utils');

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

    client.on('authenticated', () => {
        console.log('autenticado com sucesso!');
    });

    client.on('auth_failure', (message) => {
        console.log('autenticadção falhou!');
        console.log(message)
        deleteTokenResultados(nameSession);
        emitToAllClientsSession(nameSession, 'StatusClient', 'disconnected');
    });

    client.on('disconnected', () => {
        console.log('cliente desconectado!');
        deleteTokenResultados(nameSession);
        emitToAllClientsSession(nameSession, 'StatusClient', 'disconnected');
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

        client.on('qr', (qr) => {
            console.log('qr code necessário');
            reject({state: false, data: "escanear-qr-code"});
        });

        client.on('authenticated', () => {
            console.log('autenticado com sucesso!');
        });

        client.on('auth_failure', (message) => {
            console.log('autenticadção falhou!');
            console.log(message);
            reject({state: false, data: message});
        });

        client.on('disconnected', () => {
            console.log('cliente desconectado!');
        });
    
        client.on('ready', () => {
            console.log('Client is ready!');
            sessions[nameSession] = client;
            resolve({state: true, data: client});
        });
    
        client.on('change_state', (state) => {
            console.log('status mudou', state);
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