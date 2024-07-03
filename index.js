const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const { listenWebSocket } = require('./websocket');
const { allTokensExist } = require('./utils');
const { createOldSession } = require('./whatsapp');
const { deleteTokenResultados } = require('./utils');
const routes = require('./routes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const store = new MongoStore({ mongoose: mongoose });

    const server = http.createServer(app);

    const wss = new WebSocket.Server({ server });

    listenWebSocket(wss, store);

    app.use('/', routes);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, async () => {

        const sessionExists = await store.sessionExists({session: 'RemoteAuth-sessionBotResultados'});

        console.log('Servidor iniciado na porta:', PORT);
        console.log('Sessão existente: ', sessionExists);

        if(sessionExists){
            try {
                const res = await createOldSession('sessionBotResultados', store);
            } catch (error) {
                console.error('Erro durante a criação da sessão:', error);
                // await deleteTokenResultados(session);
            }
        }

        // const sessionsNow = allTokensExist();

        
        // if(sessionsNow.length == 0){
        //     console.log('Nenhum token existente');
        // }

        // for(const session of sessionsNow){
        //     console.log('token existe para: ', session);

        //     try {
        //     const res = await createOldSession(session);
        //     } catch (error) {
        //         console.error('Erro durante a criação da sessão:', error);
        //         await deleteTokenResultados(session);
        //     }

        // }
        
    });

}).catch((err) => {
    console.error('MongoDB connection error:', err);
});
