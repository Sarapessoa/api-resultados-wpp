const { sendMessage, sendResultadosMesasge} = require('./controllers/sendMessageController');
const { setRecipients, getRecipients } = require('./controllers/recipientsController');
const { getAviso, setAviso } = require('./controllers/avisoController');
const { getInfos, getStatusClient } = require('./controllers/infosController');
const { getContacts, getContact, checkContact } = require('./controllers/contactsController');
const { getGrupos, getGrupoForName, criarGrupo, colocarMembroGrupo, removerMembroGrupo, getGroupInviteLink, colocarMembrosGrupo } = require('./controllers/groupsController');
const { getTransmissions } = require('./controllers/transmissionController');
const { getChat, getAllMessagesChat } = require('./controllers/chatsController');
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
router.get('/client', getStatusClient);

// Contatos do número
router.get('/contacts', getContacts);
router.get('/contacts/:number', getContact);
router.get('/check/:number', checkContact);

// Grupos do número
router.get('/groups', getGrupos);
router.get('/groups/:name', getGrupoForName);
router.post('/group', criarGrupo);
router.post('/group/member', colocarMembroGrupo);
router.post('/group/members', colocarMembrosGrupo);
router.delete('/group/member', removerMembroGrupo);
router.get('/group/:id/convite', getGroupInviteLink);

// Listas de transmissão
router.get('/transmissions', getTransmissions);

//Chats
router.get('/chat/:number', getChat);
router.get('/chat/:number/messages', getAllMessagesChat);

module.exports = router;