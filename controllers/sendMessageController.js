const { getDestinos, getTextForResultados } = require('../utils');
// const { getClienteVenom, getAllClientsVenom } = require('../venom');
const { getClient, getAllClients } =  require('../whatsapp');

const sendMessage = async (req, res) => {
    const { msg, destinos } = req.body;
    const { session } = req.headers;

    const client = getClient(session);

    if (client == undefined) return res.status(404).send('Sessão não encontrada');

    try {
        for (const destino of destinos) {
            const result = await client.sendMessage(destino, msg);
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

    const allClients = getAllClients();

    for (const session in allClients) {
        const client = allClients[session];

        const { destinos, contact } = await getDestinos(session);

        try {

            const aviso = await getTextForResultados();
            for (const destino of destinos) {

                const result = await client.sendMessage(destino, msg);
                // console.log('Result: ', result);

                if(contact != ""){
                    const resultAviso = await client.sendMessage(destino, aviso);
                    // console.log('Result: ', resultAviso); // return object success
                    
                    const contactVcard = await client.getContactById(contact);                 
                    const resultContact = await client.sendMessage(destino, contactVcard, { parseVCards: true });
                    // console.log('Result: ', resultContact);
                }

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