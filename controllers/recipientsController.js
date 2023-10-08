const { setDestinos, getDestinos } = require('../utils');

const setRecipients = async (req, res) => {
    const destinos = req.body.destinos;

    try {

        await setDestinos(destinos);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro para modificar destinatários!');
    }

    // Envie a resposta aqui, fora do bloco try-catch
    return res.send('Destinatários atualizados com sucesso!');
};

const getRecipients =  async (req, res) => {
    try {

        const destinos = await getDestinos();

        return res.json(destinos);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro para acessar destinatários!');
    }
};

module.exports = { setRecipients, getRecipients }