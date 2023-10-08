const { getTextForResultados, setTextForResultados } = require('../utils');

const getAviso =  async (req, res) => {


    try {

        const aviso = await getTextForResultados();

        return res.json({msg: aviso});

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro para acessar a mensagem de aviso!');
    }
};

const setAviso =  async (req, res) => {
    const newAviso = req.body.msg;

    try {
        const result = await setTextForResultados(newAviso);

    } catch (erro) {
        console.error('Error when sending: ', erro); // return object error
        return res.status(500).send('Erro para acessar a mensagem de aviso!');
    }

    return res.send('Mensagem de aviso alterada com successo!')
};

module.exports = { getAviso, setAviso }