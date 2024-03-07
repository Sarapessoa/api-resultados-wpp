const { getClienteVenom } = require('../venom');
const { getClient, getAllClients } =  require('../whatsapp');

const getInfos = async (req, res) => {

    const { session } = req.headers;

    const client = getClient(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

    try {

        const result = await client.info;
        const picture = await client.getProfilePicUrl(result.me._serialized);
        let infos = {... result};
        infos.img = picture;

        return res.json(infos);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro para acessar as informações!');
    }
};

const getStatusClient = async (req, res) => {

    try {
        const { session } = req.headers;

        const client = getClient(session);
    
        let status = '';

        const statusWA = await client.getState();

        status = client == undefined ? 'disconnected' : statusWA.toLowerCase();

        return res.json({status: status});

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro para acessar as informações do status do cliente!');
    }
};

module.exports = { getInfos, getStatusClient }