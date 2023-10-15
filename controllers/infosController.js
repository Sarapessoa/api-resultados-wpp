const { getClienteVenom } = require('../venom');

const getInfos = async (req, res) => {

    const { session } = req.headers;

    const client = getClienteVenom(session);

    if(client == undefined) return res.status(404).send('Sessão não encontrada');

    try {

        const result = await client.getHostDevice();

        return res.json(result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro para acessar as informações!');
    }
};

const getStatusClient = async (req, res) => {

    try {
        const { session } = req.headers;

        const client = getClienteVenom(session);
    
        let status = '';

        if (client == undefined) status = 'Disconnected'

        status = client.spinStatus.previousText;

        return res.json({status: status});

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro para acessar as informações do status do cliente!');
    }
};

module.exports = { getInfos, getStatusClient }