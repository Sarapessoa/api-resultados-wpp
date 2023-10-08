const { getClienteVenom, createNewSession} = require('./venom');
const { tokenExist, deleteTokenResultados, setDestinos } = require('./utils');

const clients = new Set();

function listenWebSocket(wss){
    let client;
    let ws;

    wss.on('connection', async (wsNew) => {
        client = getClienteVenom();
        console.log('Conexão WebSocket estabelecida');

        ws = wsNew;
    
        clients.add(ws);

    
        ws.on('close', () => {
            console.log('Cliente desconectado');
        });
    
        if (!tokenExist()) {
            emitToAllClients('StatusClient', 'DISCONNECT');
        }
        else {
            if (client != undefined) {
                const status = await client.getConnectionState();
    
                emitToAllClients('StatusClient', status);
            }
        }
    
        ws.on('message', async (message) => {
            console.log(`Mensagem recebida: ${message}`);
    
            const type = JSON.parse(message).type;
            const data = JSON.parse(message).data;
    
            console.log(type)
            console.log(data)
    
            if (type == 'qrcode') {
    
                if (tokenExist()) {
                    if (client) {
    
                        client.close()
                        .then(() => {
                            console.log('Sessão encerrada com sucesso.');
                        })
                        .catch((erro) => {
                            console.error('Erro ao encerrar a sessão:', erro);
                        });
    
                        deleteTokenResultados();
                        setDestinos([]);
                    }
    
                }
    
    
                createNewSession();
                client = getClienteVenom();
            }
    
            if (type == 'getStatusClient') {
                if (client != undefined) {
                    const status = await client.getConnectionState();
    
                    emitToAllClients('StatusClient', status);
                }
            }
    
        });
    
        if (client != undefined) {
    
            client.onStateChange((state) => {
                console.log('State changed: ', state);
    
                emitToAllClients('StatusClient', state);
    
            });
        }
    });

    if(client != undefined){
        client.onStateChange((state) => {
            console.log('State changed: ', state);
    
            if (ws != null) emitToAllClients('StatusClient', state);
    
        });
    }
}

function emitToAllClients(eventName, eventData) {
    const eventMessage = JSON.stringify({ type: eventName, data: eventData });

    for (const client of clients) {
        client.send(eventMessage);
    }
}

module.exports = { listenWebSocket, emitToAllClients }