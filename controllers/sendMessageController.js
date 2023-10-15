const { getDestinos, getTextForResultados } = require('../utils');
const { getClienteVenom, getAllClientsVenom } = require('../venom');

const sendMessage = async (req, res) => {
    const { msg, destinos } = req.body;
    const { session } = req.headers;

    const client = getClienteVenom(session);

    if (client == undefined) return res.status(404).send('Sessão não encontrada');

    try {
        for (const destino of destinos) {
            await client.setChatState(destino, 0);
            const result = await client.sendText(destino, msg);
            await client.setChatState(destino, 2);
            console.log('Result: ', result);
            await delay(1000);
        }
        return res.send('Mensagem enviada com sucesso!');
    } catch (error) {
        console.error('Error when sending: ', error);
        return res.status(500).send('Erro ao enviar a mensagem');
    }
};

const sendResultadosMesasge = async (req, res) => {
    const msg = req.body.data;

    const allClients = getAllClientsVenom();

    for (const session in allClients) {
        const client = allClients[session];

        const { destinos, contact } = await getDestinos(session);

        try {

            const aviso = await getTextForResultados();
            for (const destino of destinos) {
                await client.setChatState(destino, 0);

                const result = await client.sendText(destino, msg);
                console.log('Result: ', result);

                if(contact.number != ""){
                    const resultAviso = await client.sendText(destino, aviso);
                    console.log('Result: ', resultAviso); // return object success
                    
                    const resultContact = await client.sendContactVcard(destino, contact.number);
                    console.log('Result: ', resultContact);
                }

                await client.setChatState(destino, 2);
            }

        } catch (erro) {
            console.error('Error when sending: ', erro); // return object error
            return res.status(500).send('Erro para enviar a mensagem!');
        }

    }

    return res.status(200).send('Mensagens enviadas com sucesso!');
};

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { sendMessage, sendResultadosMesasge };