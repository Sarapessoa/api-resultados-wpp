const { Client, LocalAuth } = require('whatsapp-web.js');
const qrCode = require('qrcode');
const { deleteTokenResultados } = require('./utils');

let sessions = {};
const wwebVersion = '2.2412.54';

function createNewSession(emitToAllClientsSession, nameSession) {

    let client = new Client({
        authStrategy: new LocalAuth({
            clientId: nameSession
        }),
        puppeteer: {
            headless: true,
            executablePath: process.env.GOOGLE_CHROME_BIN || '/usr/bin/google-chrome',
            args: ['--no-sandbox', '--disable-gpu'],
        },
        webVersionCache: {
            type: 'remote',
            remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
        }
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

    client.on('auth_failure', async (message) => {
        console.log('autenticadção falhou!');
        console.log(message)
        emitToAllClientsSession(nameSession, 'StatusClient', 'disconnected');
        await client.destroy();
        sessions[nameSession] = null;
        client = null;
        deleteTokenResultados(nameSession);
    });

    client.on('disconnected', () => {
        console.log('cliente desconectado!');
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
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-gpu'],
            },
            webVersionCache: {
                type: 'remote',
                remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
            },
        });

        client.on('qr', async (qr) => {
            console.log('QR code necessário');
            await client.destroy();
            sessions[nameSession] = null;
            client = null;
            reject({ state: false, data: "escanear-qr-code" });
        });

        client.on('authenticated', () => {
            console.log('Autenticado com sucesso!');
        });

        client.on('auth_failure', async (message) => {
            console.log('Autenticação falhou!');
            console.log(message);
            await client.destroy();
            sessions[nameSession] = null;
            client = null;
            reject({ state: false, data: message });
        });

        client.on('disconnected', () => {
            console.log('Cliente desconectado!');
        });

        client.on('ready', () => {
            console.log('Cliente está pronto!');
            sessions[nameSession] = client;
            resolve({ state: true, data: client });
        });

        client.on('change_state', (state) => {
            console.log('Status mudou', state);
        });

        // Inicialize o cliente
        client.initialize().catch((error) => {
            console.error('Erro durante a inicialização do cliente:', error);
            reject({ state: false, data: error });
        });
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