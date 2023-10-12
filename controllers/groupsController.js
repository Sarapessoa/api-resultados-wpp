const { getClienteVenom } = require('../venom');

const getGrupos = async (req, res) => {

    const client = getClienteVenom();

    if(client == undefined) return;

    try {
        const result = await client.getAllChatsGroups();

        return res.json(result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro ao retornar os grupos!');
    }

};

const getGrupoForName = async (req, res) => {

    const client = getClienteVenom();

    if(client == undefined) return;


    try {
        const result = await client.getAllChatsGroups();

        const groupToFind = req.params.name; // Obtém o número fornecido na URL

        // Procura o objeto com base na propriedade 'name'
        const foundGroup = result.find((chat) => chat.contact.name == groupToFind);

        if (foundGroup) {
            return res.json(foundGroup);
        } else {
            return res.json({ message: 'Grupo não encontrado' });
        }

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro ao retornar os grupos!');
    }

};

const criarGrupo = async (req, res) => {
    const client = getClienteVenom();

    const { name, members } = req.body;

    try {
        const membersWithSuffix = members.map((member) => member + '@c.us');

        const result = await client.createGroup(name, membersWithSuffix);

        return res.send(result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro para criar grupo!');
    }

};

const colocarMembroGrupo = async (req, res) => {
    const client = getClienteVenom();

    const { id_group, number_member } = req.body;

    try {

        const number = number_member + '@c.us';

        const result = await client.addParticipant(id_group, number);

        return res.send(result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro para adicionar participante do grupo!');
    }

};

const removerMembroGrupo = async (req, res) => {
    const client = getClienteVenom();

    const { id_group, number_member } = req.body;

    try {

        const number = number_member + '@c.us';


        const result = await client.removeParticipant(id_group, number);

        return res.send(result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro deletar participante do grupo!');
    }

};

const getGroupInviteLink = async (req, res) => {
    const client = getClienteVenom();

    const { id } = req.params;

    try {


        const result = await client.getGroupInviteLink(id);;

        return res.send(result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro retornar o convite do grupo!');
    }

};

module.exports = { getGrupos, getGrupoForName, criarGrupo, colocarMembroGrupo, removerMembroGrupo, getGroupInviteLink }