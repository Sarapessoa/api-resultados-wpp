const { getClienteVenom } = require('../venom');
const { getClient, getAllClients } =  require('../whatsapp');

const getGrupos = async (req, res) => {

    const { session } = req.headers;

    const client = getClient(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

    try {
        const result = await client.getChats();
        const groups = [];

        for(let i = 0; i < result.length; i++){
            const chat = result[i];

            if(chat.isGroup) {
                groups.push(chat)
            };
        }

        return res.json(groups);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro ao retornar os grupos!');
    }

};

const getGrupoForName = async (req, res) => {

    const { session } = req.headers;

    const client = getClient(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');


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

const getPictureGroup = async (req, res) => {
    const { session } = req.headers;

    const client = getClient(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

    try {
        const id = req.params.id;

        const picture = await client.getProfilePicUrl(id);

        return res.json(picture);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro ao retornar a imagem do grupo!');
    }
}

const criarGrupo = async (req, res) => {
    const { session } = req.headers;

    const client = getClienteVenom(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

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
    const { session } = req.headers;

    const client = getClienteVenom(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

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
    const { session } = req.headers;

    const client = getClienteVenom(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

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

const colocarMembrosGrupo = async (req, res) => {
    const { session } = req.headers;

    const client = getClienteVenom(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

    const { id_group, array_members } = req.body;

    try {
        const membersWithSuffix = array_members.map((member) => member + '@c.us');
        const return_result = [];

        for(const number of membersWithSuffix){
            const result = await client.addParticipant(id_group, number);
            return_result.push(result);
            await delay(1000);
        }

        return res.json(return_result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro para adicionar participantes do grupo!');
    }

};

const getGroupInviteLink = async (req, res) => {
    const { session } = req.headers;

    const client = getClienteVenom(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

    const { id } = req.params;

    try {


        const result = await client.getGroupInviteLink(id);;

        return res.send(result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro retornar o convite do grupo!');
    }

};

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { getGrupos, getGrupoForName, criarGrupo, colocarMembroGrupo, removerMembroGrupo, getGroupInviteLink, colocarMembrosGrupo, getPictureGroup }