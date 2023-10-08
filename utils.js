function tokenExist() {
    const fs = require('fs');

    const pastaASerVerificada = 'tokens';

    try {
        // Tenta verificar a existência da pasta
        fs.accessSync(pastaASerVerificada, fs.constants.F_OK);
        return true; // A pasta existe
    } catch (err) {
        return false; // A pasta não existe
    }


}

async function setTextForResultados(conteudo) {
    const caminhoDoArquivo = 'msg_resultados.txt';
    const fs = require('fs').promises;

    try {
        const conteudoFormatado = conteudo.replace(/\n/g, '\r\n');

        await fs.writeFile(caminhoDoArquivo, conteudoFormatado, 'utf8');

        return true;
    } catch (erro) {
        throw erro;
    }
}

async function getDestinos() {
    const fs = require('fs').promises;

    try {
        const dados = await fs.readFile('destinos.json', 'utf8');
        const objetoJSON = JSON.parse(dados);
        const destinos = objetoJSON.destinos || [];
        return destinos;
    } catch (erro) {
        throw erro;
    }
}

async function setDestinos(novosDestinos) {
    const fs = require('fs').promises;

    try {
        const dados = await fs.readFile('destinos.json', 'utf8');
        const objetoJSON = JSON.parse(dados);
        objetoJSON.destinos = novosDestinos;

        await fs.writeFile('destinos.json', JSON.stringify(objetoJSON, null, 2), 'utf8');
    } catch (erro) {
        throw erro;
    }
}

async function deleteTokenResultados() {
    const fs = require('fs').promises;

    const pastaASerVerificada = 'tokens';

    try {
        const stats = await fs.stat(pastaASerVerificada);

        if (stats.isDirectory()) {

            // Agora, exclua o diretório
            await fs.rmdir(pastaASerVerificada, { recursive: true, force: true });
            console.log('Pasta sessionBotResultados foi excluída.');
        } else {
            console.log('O caminho não é um diretório.');
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log('A pasta sessionBotResultados não existe.');
        } else {
            console.error('Erro ao verificar ou excluir a pasta:', err);
        }
    }
}

async function getTextForResultados() {
    const caminhoDoArquivo = 'msg_resultados.txt';
    const fs = require('fs').promises;

    try {
        const dados = await fs.readFile(caminhoDoArquivo, 'utf8');

        // Substitua as quebras de linha pelo caractere '\n'
        const conteudoFormatado = dados.replace(/\r\n/g, '\n');

        return conteudoFormatado;
    } catch (erro) {
        throw erro;
    }
}

module.exports = {
    tokenExist,
    setTextForResultados,
    getDestinos,
    setDestinos,
    deleteTokenResultados,
    getTextForResultados,
};