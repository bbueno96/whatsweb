const venom = require('venom-bot');
const express = require('express');
const app = express();

app.use(express.json());

let clientInstance;
let qrCodeData = '';
let qrCodeGenerated = false;

function initializeVenom() {
  return venom
    .create(
      'sessionName',
      (base64Qr, asciiQR) => {
        if (!qrCodeGenerated) {
          qrCodeData = base64Qr;
          console.log('QR Code recebido', asciiQR); // Para debug
          qrCodeGenerated = true;
        }
      },
      undefined,
      { logQR: false }
    )
    .then(client => {
      clientInstance = client;
      qrCodeGenerated = false;
      console.log('Cliente iniciado');
      return client;
    })
    .catch(err => {
      console.log('Erro ao iniciar o cliente', err);
    });
}

initializeVenom();

app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;

  try {
    if (!clientInstance) {
      throw new Error('Cliente não iniciado');
    }

    await clientInstance.sendText(number + '@c.us', message);
    res.status(200).send({ status: 'Message sent successfully' });
  } catch (error) {
    res.status(500).send({ status: 'Error sending message', error: error.message });
  }
});

app.get('/get-qrcode', (req, res) => {
  if (qrCodeData) {
    res.status(200).send({ qrCode: qrCodeData });
  } else {
    res.status(200).send({ message: 'QR code not available yet, please try again later.' });
  }
});

app.get('/status', async (req, res) => {
  try {
    if (!clientInstance) {
      throw new Error('Cliente não iniciado');
    }

    const isConnected = await clientInstance.isConnected();
    if (isConnected) {
      res.status(200).send({ status: 'Logged in' });
    } else {
      res.status(200).send({ status: 'Not logged in', qrCode: qrCodeData });
    }
  } catch (error) {
    res.status(500).send({ status: 'Error checking login status', error: error.message });
  }
});

app.listen(7000, () => {
  console.log('API running on port 7000');
});
