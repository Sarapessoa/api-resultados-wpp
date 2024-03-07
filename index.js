const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const { listenWebSocket } = require('./websocket');
const { allTokensExist } = require('./utils');
const { createOldSession } = require('./whatsapp');
const routes = require('./routes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

listenWebSocket(wss);

app.use('/', routes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {

    const sessionsNow = allTokensExist();

    
    if(sessionsNow.length == 0){
        console.log('Nenhum token existente');
    }

    for(const session of sessionsNow){
        console.log('token existe para: ', session);

        try {
           const res = await createOldSession(session);
        } catch (error) {
            console.error('Erro durante a criação da sessão:', error);
        }

    }
    
});
