// const { getClienteVenom } = require('../venom');
const { getClient, getAllClients } =  require('../whatsapp');

const getContacts = async (req, res) => {

    const { session } = req.headers;

    const client = getClient(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

    try {
        const result = await client.getContacts();

        return res.json(result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro ao retornar os contatos!');
    }

};

const getContact = async (req, res) => {

    const { session } = req.headers;

    const client = getClienteVenom(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

    try {
        const result = await client.getAllContacts();

        const numberToFind = req.params.number;

        const foundContact = result.find((contact) => contact.id.user == numberToFind);

        if (foundContact) {
            return res.json(foundContact);
        } else {
            return res.json({ message: 'Contato não encontrado' });
        }

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro ao retornar o contato!');
    }

};

const getPictureContact = async (req, res) => {
    const { session } = req.headers;

    const client = getClient(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

    try {
        const id = req.params.id;

        const picture = await client.getProfilePicUrl(id);

        return res.json(picture);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro ao retornar a imagem do contato!');
    }
}

const checkContact = async (req, res) => {

    const { session } = req.headers;

    const client = getClienteVenom(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

    try {
        const number = (req.params.number) + '@c.us';

        const result = await client.checkNumberStatus(number);

        return res.json(result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro ao retornar o status do contato!');
    }

};

module.exports = { getContacts, getContact, checkContact, getPictureContact }