const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const venom = require('venom-bot');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' }});

app.use(express.json({ extended: true, limit: '10mb', timeout: 120000 })); // 120 segundos (2 minutos)

let socket;
let client;

const chromiumArgs = [
    '--disable-web-security', '--no-sandbox', '--disable-web-security',
    '--aggressive-cache-discard', '--disable-cache', '--disable-application-cache',
    '--disable-offline-load-stale-cache', '--disk-cache-size=0',
    '--disable-background-networking', '--disable-default-apps', '--disable-extensions',
    '--disable-sync', '--disable-translate', '--hide-scrollbars', '--metrics-recording-only',
    '--mute-audio', '--no-first-run', '--safebrowsing-disable-auto-update',
    '--ignore-certificate-errors', '--ignore-ssl-errors', '--ignore-certificate-errors-spki-list'
];

// Rota para gerar o QR code
app.get('/qrcode', (req, res) => {
    // deleteTokenResultados();

    const fs = require('fs');
    const qrcode = require('qrcode-terminal');

    venom
        .create(
            'sessionBotResultados',
            (base64Qr, asciiQR, attempts, urlCode) => {
                console.log(asciiQR); // Optional to log the QR in the terminal

                console.log('rota post')
                var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
                    response = {};

                if (matches.length !== 3) {
                    return new Error('Invalid input string');
                }
                response.type = matches[1];
                response.data = new Buffer.from(matches[2], 'base64');

                var imageBuffer = response;

                res.send(`
                    <html>
                    <head>
                        <title>QR Code</title>
                    </head>
                    <body>
                        <img src="${base64Qr}" alt="QR Code">
                    </body>
                    </html>`
                );

            },
            (statusSession, session) => {
                console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
                //Create session wss return "serverClose" case server for close
                console.log('Session name: ', session);

            },
            {
                logQR: false,
                browserArgs: chromiumArgs,
            }
        )
        .then((client) => {
            start(client);
        })
        .catch((erro) => {
            console.log(erro);
        });
});

io.on('connection', (socketClient) => {
    console.log('Cliente conectado');

    socket = socketClient;

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });

    if (!tokenExist()){
        socket.emit('statusClient', 'DISCONNECT');
    }

    socket.on('qrcode', async () => {
        console.log('Socket on qrcode');

        if(tokenExist()){
            if(client){

                client.close()

                if (client instanceof venom.Whatsapp) {
                    let browser = client.page.browser();
                    browser.close();
                }
            }
            
        }


        venom
            .create(
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

                    socket.emit('qrCodeBase64', base64Qr);

                },
                (statusSession, session) => {
                    socket.emit('StatusQrCodeBase64', statusSession);
                    console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
                    //Create session wss return "serverClose" case server for close
                    console.log('Session name: ', session);

                },
                {
                    logQR: false,
                    browserArgs: chromiumArgs
                }
            )
            .then((client) => {
                start(client);
            })
            .catch((erro) => {
                console.log(erro);
            });
    });

    socket.on('getStatusClient', async () => {

        if(client != undefined){
            const status = await client.getConnectionState();

            socket.emit('statusClient', status);
        }
    });

    if(client != undefined){

        client.onStateChange((state) => {
            console.log('State changed: ', state);
    
            socket.emit('statusClient', state);
    
        });
    }

    socket.on('logout', async () => {

        if(client){

            if (client instanceof venom.Whatsapp) {
                let browser = client.page.browser();
                browser.close();
            }
        }
    })

});


async function start(clientService) {
    client = clientService;

    client.onMessage(async (message) => {
        console.log(message);
    });

    app.post('/send', async (req, res) => {
        const msg = req.body.data;

        console.log(msg);

        const aviso = 'Vem conferir seu prêmio 💰🤑\nEntre em contato com a nossa *central de atendimento* 👇🏻';

        try {
            const result = await client.sendText(process.env.CODE_GROUP, msg);
            console.log('Result: ', result); // return object success

            const resultAviso = await client.sendText(process.env.CODE_GROUP, aviso);
            console.log('Result: ', resultAviso); // return object success

            const resultContact = await client.sendContactVcard(process.env.CODE_GROUP, '5511961799124@c.us', 'Central - Aladin Loterias');
            console.log('Result: ', resultContact); // return object success

        } catch (erro) {
            console.error('Error when sending: ', erro); // return object error
            return res.send('Erro para enviar a mensagem!');
        }

        // Envie a resposta aqui, fora do bloco try-catch
        return res.send('Mensagem enviada com sucesso!');
    });

    app.get('/contacts', async (req, res) => {

        try {
            const result = await client.getAllContacts();
            console.log('Result: ', result); // return object success

            return res.json(result);

        } catch (erro) {
            console.error('Error when sending: ', erro); // return object error
            return res.send('Erro ao retornar os contatos!');
        }

    });

    app.get('/contacts/:number', async (req, res) => {

        try {
            const result = await client.getAllContacts();
            console.log('Result: ', result);

            const numberToFind = req.params.number; // Obtém o número fornecido na URL

            // Procura o objeto com base na propriedade 'id.user'
            const foundContact = result.find((contact) => contact.id.user === numberToFind);

            if (foundContact) {
                return res.json(foundContact);
            } else {
                return res.json({ message: 'Contato não encontrado' });
            }

        } catch (erro) {
            console.error('Error when sending: ', erro); // return object error
            return res.send('Erro ao retornar o contato!');
        }

    });

    app.get('/groups', async (req, res) => {

        try {
            const result = await client.getAllChatsGroups();
            console.log('Result: ', result); // return object success

            return res.json(result);

        } catch (erro) {
            console.error('Error when sending: ', erro); // return object error
            return res.send('Erro ao retornar os grupos!');
        }

    });

    app.get('/groups/:name', async (req, res) => {

        try {
            const result = await client.getAllChatsGroups();
            console.log('Result: ', result); // return object success

            const groupToFind = req.params.name; // Obtém o número fornecido na URL

            // Procura o objeto com base na propriedade 'name'
            const foundGroup = result.find((chat) => chat.name === groupToFind);

            if (foundGroup) {
                return res.json(foundGroup);
            } else {
                return res.json({ message: 'Grupo não encontrado' });
            }

        } catch (erro) {
            console.error('Error when sending: ', erro); // return object error
            return res.send('Erro ao retornar os grupos!');
        }

    });

    app.post('/group', async (req, res) => {
        const { name, members } = req.body;

        try {
            const membersWithSuffix = members.map((member) => member + '@c.us');

            const result = await client.createGroup(name, membersWithSuffix);

            return res.send(result);

        } catch (erro) {
            console.error('Error when sending: ', erro); // return object error
            return res.send('Erro para criar grupo!');
        }

    });

    app.post('/group/member', async (req, res) => {
        const { id_group, number_member } = req.body;

        try {

            const number = number_member + '@c.us';


            const result = await client.addParticipant(id_group, number);

            return res.send(result);

        } catch (erro) {
            console.error('Error when sending: ', erro); // return object error
            return res.send('Erro para adicionar participante do grupo!');
        }

    });

    app.delete('/group/member', async (req, res) => {
        const { id_group, number_member } = req.body;

        try {

            const number = number_member + '@c.us';


            const result = await client.removeParticipant(id_group, number);

            return res.send(result);

        } catch (erro) {
            console.error('Error when sending: ', erro); // return object error
            return res.send('Erro deletar participante do grupo!');
        }

    });

    client.onStateChange((state) => {
        console.log('State changed: ', state);

        if(socket != null) socket.emit('statusClient', state);

    });

    socket.on('getStatusClient', async () => {
        const status = await client.getConnectionState();

        socket.emit('statusClient', status);
    });

    socket.on('logout', async () => {

        if(client){
            // const res_logout = await client.logout();
            // console.log(res_logout);
        }
    })

}

app.get('/start', (req, res) => {

    if (!tokenExist()) return res.send('Dispositivo não conectado!');

    const fs = require('fs');

    venom
        .create({
            session: 'sessionBotResultados', //name of session
            headless: 'old',
            browserArgs: chromiumArgs,
        })
        .then((client) => start(client))
        .catch((erro) => {
            console.log(erro);
        });
});


function rewriteCode(code) {
    const fs = require('fs');

    const targetVariableName = 'CODE_GROUP';

    // Novo valor para a variável
    const newValue = code;

    // Caminho para o arquivo .env
    const envFilePath = '.env';

    // Leitura do conteúdo atual do arquivo .env
    fs.readFile(envFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo .env:', err);
            return;
        }

        // Dividir o conteúdo em linhas
        const lines = data.split('\n');

        // Encontrar a linha que contém a variável desejada
        let updatedEnvContent = '';
        for (const line of lines) {
            if (line.startsWith(`${targetVariableName}=`)) {
                // Atualize a linha da variável desejada
                updatedEnvContent += `${targetVariableName}=${newValue}\n`;
            } else {
                // Mantenha outras linhas inalteradas
                updatedEnvContent += line + '\n';
            }
        }

        // Escreva o novo conteúdo de volta no arquivo .env
        fs.writeFile(envFilePath, updatedEnvContent, 'utf8', (err) => {
            if (err) {
                console.error('Erro ao escrever no arquivo .env:', err);
                return;
            }

            console.log(`Variável ${targetVariableName} atualizada com sucesso!`);
        });
    });
}

// Inicie o servidor na porta de sua escolha
const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Servidor socket novo em execução na porta ${port}`);

    if(tokenExist()){
        console.log('existe');
        // deleteTokenResultados();
    }
    else{
        console.log('nao existe');
        if(socket != undefined){
            socket.emit('statusClient', 'DISCONNECT');
        }
    }

    if (tokenExist()) {
        venom
            .create({
                session: 'sessionBotResultados', //name of session
                headless: 'old',
                browserArgs: chromiumArgs,
            })
            .then((client) => start(client))
            .catch((erro) => {
                console.log(erro);
            });
    }
});

async function deleteTokenResultados() {
    const fs = require('fs').promises;

    const pastaASerVerificada = 'tokens';

    try {
        const stats = await fs.stat(pastaASerVerificada);
        
        if (stats.isDirectory()) {
            // Verifique se o diretório existe

            // Lista de arquivos a serem excluídos (adicione os arquivos que deseja excluir)
            // const arquivosAExcluir = ['chrome_debug.log'];

            // for (const arquivo of arquivosAExcluir) {
            //     const arquivoPath = `${pastaASerVerificada}/${arquivo}`;
            //     try {
            //         await fs.unlink(arquivoPath);
            //         console.log(`Arquivo ${arquivo} excluído.`);
            //     } catch (err) {
            //         console.error(`Erro ao excluir ${arquivo}:`, err);
            //     }
            // }

            // Agora, exclua o diretório
            await fs.rmdir(pastaASerVerificada, { recursive: true , force: true});
            console.log('Pasta sessionBotResultados foi excluída.');
        } else {
            console.log('O caminho não é um diretório.');
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log('A pasta sessionBotResultados não existe.');
        } else {
            console.error('Erro ao verificar ou excluir a pasta:', err);
        }
    }
}



function tokenExist() {
    const fs = require('fs');

    const pastaASerVerificada = 'tokens/sessionBotResultados';

    try {
        // Tenta verificar a existência da pasta
        fs.accessSync(pastaASerVerificada, fs.constants.F_OK);
        return true; // A pasta existe
    } catch (err) {
        return false; // A pasta não existe
    }


}
