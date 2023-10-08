const { sendMessage, sendResultadosMesasge} = require('./controllers/sendMessageController');
const { setRecipients, getRecipients } = require('./controllers/recipientsController');
const { getAviso, setAviso } = require('./controllers/avisoController');
const { getInfos } = require('./controllers/infosController');
const { getContacts, getContact } = require('./controllers/contactsController');
const { getGrupos, getGrupoForName, criarGrupo, colocarMembroGrupo, removerMembroGrupo } = require('./controllers/groupsController');
const express = require('express');

const router = express.Router();

// Envio de mensagens
router.post('/send', sendMessage);
router.post('/send/resultados', sendResultadosMesasge);

// Destinatários dos resultados
router.post('/recipients', setRecipients);
router.get('/recipients', getRecipients);

// Aviso enviado logo após os resultados
router.post('/aviso', setAviso);
router.get('/aviso', getAviso);

// Informações do telefone conectado
router.get('/infos', getInfos);

// Contatos do número
router.get('/contacts', getContacts);
router.get('/contacts/:number', getContact);

// Grupos do número
router.get('/groups', getGrupos);
router.get('/groups/:name', getGrupoForName);
router.post('/group', criarGrupo);
router.post('group/:member', colocarMembroGrupo);
router.delete('/group/:member', removerMembroGrupo);


module.exports = router;