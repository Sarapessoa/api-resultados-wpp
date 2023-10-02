const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const venom = require('venom-bot');

dotenv.config();

const app = express();

app.use(express.json({ extended: true, limit: '10mb', timeout: 120000 })); // 120 segundos (2 minutos)

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

app.get('/start', (req, res) => {

    if(!tokenExist()) return res.send('Dispositivo não conectado!');

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

app.post('/teste1', (req, res) => {
    const msg = req.body.data;
    console.log(msg)

    const resposta = {
        mensagem: msg
    };

    return res.json(resposta)
});


function start(client) {
    client.onMessage((message) => {
        console.log(message);
        if (message.body == 'faça deste o grupo de resultados') {
            rewriteCode(message.from);
        }
    });

    app.post('/teste2', (req, res) => {
        const msg = req.body.data;
        console.log(msg)
    
        const resposta = {
            mensagem: msg
        };
    
        return res.json(resposta)
    });


    app.post('/send', (req, res) => {
        const msg = req.body.data;

        console.log(msg)

        const aviso = 'Vem conferir seu prêmio 💰🤑\nEntre em contato com a nossa *cambista on-line* pelo _link_ abaixo 👇🏻\nhttps://whre.me/Ezxip'

        client
            .sendText(process.env.CODE_GROUP, msg)
            .then((result) => {
                console.log('Result: ', result); //return object success

                client
                    .sendText(process.env.CODE_GROUP, aviso)
                    .then((result) => {
                        console.log('Result: ', result); //return object success

                        return res.send('Mensagem enviada com sucesso!');
                    })
                    .catch((erro) => {
                        console.error('Error when sending: ', erro); //return object error

                        return res.send('Erro para enviar a mensagem!');
                    });

            })
            .catch((erro) => {
                console.error('Error when sending: ', erro); //return object error

                return res.send('Erro para enviar a mensagem!');
            });

    })
}

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
app.listen(port, () => {
    console.log(`Servidor novo em execução na porta ${port}`);

    if(tokenExist()){
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

function deleteTokenResultados() {
    const fs = require('fs');
    const pastaASerVerificada = 'tokens/sessionBotResultados';

    fs.stat(pastaASerVerificada, (err, stats) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log('A pasta sessionBotResultados não existe.');
            } else {
                console.error('Erro ao verificar a pasta:', err);
            }
        } else {
            if (stats.isDirectory()) {
                // O diretório existe, agora exclua-o
                fs.rmdir(pastaASerVerificada, { recursive: true }, (err) => {
                    if (err) {
                        console.error('Erro ao excluir a pasta:', err);
                    } else {
                        console.log('Pasta sessionBotResultados foi excluída.');
                    }
                });
            } else {
                console.log('O caminho não é um diretório.');
            }
        }
    });
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
