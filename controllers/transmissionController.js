const { getClienteVenom } = require('../venom');

const getTransmissions = async (req, res) => {

    const client = getClienteVenom();

    if(client == undefined) return;

    try {
        const result = await client.getAllChatsTransmission();

        return res.json(result);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro ao retornar as listas de transmissões!');
    }

};

module.exports = { getTransmissions };