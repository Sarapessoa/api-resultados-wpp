const { getDestinos, getTextForResultados } = require('../utils');
const { getClienteVenom } = require('../venom');

const sendMessage = async (req, res) => {
    const msg = req.body.data;
    const arrayDestinos = await getDestinos();
    const client = getClienteVenom();

    try {
        for (const destino of arrayDestinos) {
            const result = await client.sendText(destino, msg);
            console.log('Result: ', result);
        }
        return res.send('Mensagem enviada com sucesso!');
    } catch (error) {
        console.error('Error when sending: ', error);
        return res.status(500).send('Erro ao enviar a mensagem');
    }
};

const sendResultadosMesasge = async (req, res) => {
    const msg = req.body.data;

    const arrayDestinos = await getDestinos();
    const client = getClienteVenom();

    try {
        
        const aviso = await getTextForResultados();
        for (const destino of arrayDestinos) {
            const result = await client.sendText(destino, msg);
            console.log('Result: ', result);

            const resultAviso = await client.sendText(destino, aviso);
            console.log('Result: ', resultAviso); // return object success

            const resultContact = await client.sendContactVcard(destino, '5511961799124@c.us', 'Central - Aladin Loterias');
            console.log('Result: ', resultContact);
        }

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro para enviar a mensagem!');
    }

    // Envie a resposta aqui, fora do bloco try-catch
    return res.send('Mensagem enviada com sucesso!');
};

module.exports = { sendMessage, sendResultadosMesasge };