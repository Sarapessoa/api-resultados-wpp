// const { createNewSession, getAllClientsVenom} = require('./venom');
const { createNewSession, getAllClients } = require('./whatsapp');
const { tokenExist, deleteTokenResultados, setDestinos } = require('./utils');

let clients = {};
const clientsSessions = {};

function listenWebSocket(wss, store) {
    let ws;
    let nameSession;

    wss.on('connection', async (wsNew) => {
        clients = getAllClients();
        console.log('Conexão WebSocket estabelecida');

        ws = wsNew;
    
        ws.on('close', () => {
            console.log('Cliente desconectado');
        });
    
        ws.on('message', async (message) => {
            console.log(`Mensagem recebida: ${message}`);
    
            const type = JSON.parse(message).type;
            const data = JSON.parse(message).data;
    
            console.log(type)
            console.log(data)

            if(type == 'setNameSession'){
                nameSession = data;

                if(!clientsSessions.hasOwnProperty(nameSession)){
                    clientsSessions[nameSession] = new Set();
                }

                clientsSessions[nameSession].add(ws);

                console.log('entrou no type', type);
                console.log('name session', nameSession);

                const sessionExists = await store.sessionExists({session: `RemoteAuth-${nameSession}`});

                if (!sessionExists) {
                    emitToAllClientsSession(nameSession, 'StatusClient', 'DISCONNECT');
                    console.log('desconectado');
                }
                else {
                    // console.log(clients[nameSession]);
                    if (clients[nameSession] != undefined) {
                        const status = await clients[nameSession].getState();

                        console.log(status);
            
                        emitToAllClientsSession(nameSession, 'StatusClient', status)
                        console.log('conectado');
                    }
                }
            }

    
            if (type == 'qrcode') {
    
                // if (tokenExist(nameSession)) {
                //     if (clientsVenom[nameSession]) {
    
                //         clientsVenom[nameSession].close()
                //         .then(() => {
                //             console.log('Sessão encerrada com sucesso.');
                //         })
                //         .catch((erro) => {
                //             console.error('Erro ao encerrar a sessão:', erro);
                //         });
    
                //         deleteTokenResultados(nameSession);
                //         setDestinos(nameSession, []);
                //     }
    
                // }
    
    
                createNewSession(emitToAllClientsSession, nameSession, store);
                clients = getAllClients();
            }
    
            if (type == 'getStatusClient') {
                if (clients[nameSession] != undefined) {
                    // const status = await clientsVenom[nameSession].getConnectionState();
    
                    // emitToAllClientsSession(nameSession, 'StatusClient', status)
                }
            }
    
        });
    
        if (clients[nameSession] != undefined) {
    
            // clientsVenom[nameSession].onStateChange((state) => {
            //     console.log('State changed: ', state);
    
            //     emitToAllClientsSession(nameSession, 'StatusClient', state)
    
            // });
        }
    });
}

function emitToAllClients(eventName, eventData) {
    const eventMessage = JSON.stringify({ type: eventName, data: eventData });

    for (const session of clientsSessions) {
        console.log(session);
        // client.send(eventMessage);
    }
}

function emitToAllClientsSession(session, eventName, eventData) {
    const eventMessage = JSON.stringify({ type: eventName, data: eventData });

    for (const client of clientsSessions[session]) {
        client.send(eventMessage);
    }
}


module.exports = { listenWebSocket, emitToAllClients }