const venom = require('venom-bot');
const { chromiumArgs } = require('./config');
const { setDestinos, deleteTokenResultados } = require('./utils');
const { emitToAllClients } = require('./websocket');

let venomClient;
let process;
let client;

function createOldSession() {
    venom.create(
        'sessionBotResultados',
        undefined,
        (sessionStatus, session) => {
            if (sessionStatus === 'isLogged') {
                console.log('A sessão está autenticada.');
            } else if (sessionStatus === 'notLogged') {
                if(venomClient){
                    venomClient.close().then(() => {
                        deleteTokenResultados();
                    });
                }
                setDestinos([])
                console.log('A sessão não está autenticada.');
            }
        },
        {
            headless: 'old',
            browserArgs: chromiumArgs,
            devtools: false
        },
        (browser, waPage) => {
            venomClient = browser;
            process = browser.process();
        }
    ).then((client) => startClient(client) ).catch((error) => {
        console.error('Erro ao inicializar Venom:', error);
    });
}

function createNewSession() {
    venom.create(
        'sessionBotResultados',
        (base64Qr, asciiQR, attempts, urlCode) => {
            console.log(asciiQR); // Optional to log the QR in the terminal

            var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                response = {};

            if (matches.length !== 3) {
                return new Error('Invalid input string');
            }
            response.type = matches[1];
            response.data = new Buffer.from(matches[2], 'base64');

            emitToAllClients('QrCodeBase64', base64Qr);

        },
        (statusSession, session) => {
            emitToAllClients('StatusQrCodeBase64', statusSession);
            console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
            //Create session wss return "serverClose" case server for close
            console.log('Session name: ', session);

        },
        {
            logQR: false,
            browserArgs: chromiumArgs
        },
        (browser, waPage) => {
            process = browser.process();
            venomClient = browser;
        }
    ).then((client) => startClient(client) ).catch((error) => {
        console.error('Erro ao inicializar Venom:', error);
    });
}

function startClient(clientSession){
    client = clientSession;

    client.onMessage(async (message) => {
        console.log(message);
    });
}

function getClienteVenom(){
    return client;
}

module.exports = {createNewSession, createOldSession, getClienteVenom}