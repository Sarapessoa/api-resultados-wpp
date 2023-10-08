const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const { listenWebSocket } = require('./websocket');
const { tokenExist } = require('./utils');
const { createOldSession } = require('./venom');
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
server.listen(PORT, () => {
    
    if(tokenExist()){
        console.log('token existe!');
        createOldSession();
    }
    else{
        console.log('token não existe');
    }
});
