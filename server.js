const venom = require('venom-bot');
const express = require('express');
const app = express();

let client;

app.use(express.json());

venom
 .create({
    session: 'nome_da_sessao' // nome da sessão
 })
 .then((cli) => {
    client = cli;
    start(client);
 })
 .catch((erro) => {
    console.log(erro);
 });

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/qrcode.html');
});

app.post('/send-message', async (req, res) => {
    const { phone, message } = req.body;

    try {
        await client.sendText(phone + '@c.us', message);
        res.status(200).json({ status: 'success', message: 'Mensagem enviada com sucesso.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error });
    }
});

app.listen(3000, () => {
    console.log('Aplicativo ouvindo na porta 3000!');
});

function start(client) {
    client.onMessage((message) => {
        if (message.body === 'Hi' && message.isGroupMsg === false) {
            client.sendText(message.from, 'Olá, bem vindo ao nosso serviço!');
        }
    });
}