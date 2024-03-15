const venom = require('venom-bot');
const express = require('express');
const app = express();
const qrCode = require('qrcode-terminal');
const fs = require('fs');


let client;

app.use(express.json());
app.use('/static', express.static('public'));

venom
 .create({
    session: 'nome_da_sessao', // nome da sessão 
    puppeteerOptions: {
      timeout: 60000, // Defina o tempo limite como 0 para desativar ou substitua por um valor em milissegundos
    },
 },
{updatesLog:false,disableWelcome: true},
    (base64Qrimg)=> {
                // Escrevendo o buffer em um arquivo
        const base64Data = base64Qrimg.replace(/^data:image\/png;base64,/, '');
        fs.writeFile('public/qrcode.png', base64Data, 'base64', (err) => {
            if (err) {
                console.error('Erro ao escrever o arquivo:', err);
                return;
            }
            console.log('Arquivo salvo com sucesso!');
        });
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

// Rota para servir o arquivo do QR code
app.get('/qrcode.png', (req, res) => {
    try {
        // Lendo o arquivo do QR code
        const qrCodeImage = fs.readFileSync('qrcode.png');
console.log(qrCodeImage)

        // Enviando a imagem como resposta
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(qrCodeImage, 'binary');
    } catch (error) {
        console.error('Erro ao ler o arquivo do QR code:', error);
        res.status(500).send('Erro ao carregar o QR code.');
    }
});


app.listen(2000, () => {
    console.log('Aplicativo ouvindo na porta 2000!');
});

function start(client) {
    client.onMessage((message) => {
        if (message.body === 'oi' && message.isGroupMsg === false) {
            client.sendText(message.from, 'Olá, bem vindo ao nosso serviço!');
        }
    });
}
