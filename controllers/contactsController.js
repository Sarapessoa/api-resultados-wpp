const { getClienteVenom } = require('../venom');

const getContacts = async (req, res) => {

    const client = getClienteVenom();

    try {
        const result = await client.getAllContacts();

        return res.json(result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro ao retornar os contatos!');
    }

};

const getContact = async (req, res) => {

    const client = getClienteVenom();

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

const checkContact = async (req, res) => {

    const client = getClienteVenom();

    try {
        const number = (req.params.number) + '@c.us';

        const result = await client.checkNumberStatus(number);

        return res.json(result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro ao retornar o status do contato!');
    }

};

module.exports = { getContacts, getContact, checkContact }