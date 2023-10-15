const { getClienteVenom } = require('../venom');

const getChat = async (req, res) => {

    const { number } = req.params;

    const { session } = req.headers;

    const client = getClienteVenom(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

    try {
        const result = await client.getChat(number);

        return res.json(result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro os chats!');
    }

};

const getAllMessagesChat = async (req, res) => {

    const { number } = req.params;

    const { session } = req.headers;

    const client = getClienteVenom(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

    try {
        const result = await client.getAllMessagesInChat(number);

        return res.json(result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro os chats!');
    }

};


module.exports = { getChat, getAllMessagesChat }