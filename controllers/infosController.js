const { getClienteVenom } = require('../venom');

const getInfos = async (req, res) => {

    const client = getClienteVenom();

    if(client == undefined) return;

    try {

        const result = await client.getHostDevice();

        return res.json(result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro para acessar as informações!');
    }
};

module.exports = { getInfos }