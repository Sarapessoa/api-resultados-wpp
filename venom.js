const venom = require('venom-bot');
const { chromiumArgs } = require('./config');
const { setDestinos, deleteTokenResultados } = require('./utils');

let venomClient;
let process;
let client;
let sessions = {};

function createOldSession(nameSession) {
    return new Promise((resolve, reject) => {
        venom.create(
            nameSession,
            undefined,
            (sessionStatus, session) => {
                if (sessionStatus === 'isLogged') {
                    console.log('A sessão está autenticada.');
                    resolve(session); // Resolva a Promise quando a sessão estiver autenticada
                } else if (sessionStatus === 'notLogged') {
                    if (venomClient) {
                        venomClient.close().then(() => {
                            deleteTokenResultados(nameSession);
                        });
                    }
                    setDestinos(nameSession, []);
                    console.log('A sessão não está autenticada.');
                    reject('A sessão não está autenticada'); // Rejeite a Promise se a sessão não estiver autenticada
                }
            },
            {
                headless: 'old',
                browserArgs: chromiumArgs,
                devtools: true,
            },
            (browser, waPage) => {
                venomClient = browser;
                process = browser.process();
            }
        )
            .then((client) => {
                startClient(client, nameSession);
            })
            .catch((error) => {
                console.error('Erro ao inicializar Venom:', error);
                reject(error); // Rejeite a Promise em caso de erro
            });
    });
}

function createNewSession(emitToAllClientsSession, nameSession) {
    venom.create(
        nameSession,
        (base64Qr, asciiQR, attempts, urlCode) => {
            console.log(asciiQR); // Optional to log the QR in the terminal

            var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                response = {};

            if (matches.length !== 3) {
                return new Error('Invalid input string');
            }
            response.type = matches[1];
            response.data = new Buffer.from(matches[2], 'base64');

            emitToAllClientsSession(nameSession, 'QrCodeBase64', base64Qr);

        },
        (statusSession, session) => {
            emitToAllClientsSession(nameSession, 'StatusQrCodeBase64', statusSession);
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
    ).then((client) => startClient(client, nameSession)).catch((error) => {
        console.error('Erro ao inicializar Venom:', error);
    });
}

function startClient(clientSession, nameSession) {
    sessions[nameSession] = clientSession;
    client = clientSession;

    client.onMessage(async (message) => {
        console.log(message);
    });

    client.onAddedToGroup(chatEvent => {
        console.log(chatEvent);
    });
}

function getAllClientsVenom() {
    return sessions;
}

function getClienteVenom(session) {
    if(sessions.hasOwnProperty(session)){
        return sessions[session];
    }

    return undefined;
}

module.exports = { createNewSession, createOldSession, getClienteVenom, getAllClientsVenom }