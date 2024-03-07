const { setDestinos, getDestinos } = require('../utils');
// const { getClienteVenom } = require('../venom');
const { getClient, getAllClients } =  require('../whatsapp');

const setRecipients = async (req, res) => {
    const destinos = req.body.destinos;

    const { session } = req.headers;

    const client = getClient(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

    try {

        await setDestinos(session, destinos);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro para modificar destinatários!');
    }

    // Envie a resposta aqui, fora do bloco try-catch
    return res.send('Destinatários atualizados com sucesso!');
};

const getRecipients =  async (req, res) => {
    try {

        const { session } = req.headers;

        const client = getClient(session);
    
        if(client == undefined) return res.status(404).send('Sessão não encontrada');

        const { destinos } = await getDestinos(session);

        return res.json(destinos);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro para acessar destinatários!');
    }
};

module.exports = { setRecipients, getRecipients }