const venom = require('venom-bot')
const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())

let clientInstance
let qrCodeData = ''
let qrCodeGenerated = false

async function initializeVenom() {
  try {
    // Disconnect previous client instance if it exists
    if (clientInstance) {
      await clientInstance.close()
      clientInstance = null
    }

    return venom
      .create(
        'teste',
        (base64Qr, asciiQR) => {
          if (!qrCodeGenerated) {
            qrCodeData = base64Qr
            qrCodeGenerated = true
          }
        },
        undefined,
        { logQR: false }
      )
      .then(client => {
        clientInstance = client
        qrCodeGenerated = false
        console.log('Cliente iniciado')
        return client
      })
      .catch(err => {
        console.log('Erro ao iniciar o cliente', err)
      })
  } catch (error) {
    console.log('Erro ao reinicializar o cliente', error)
  }
}

initializeVenom()

app.post('/send-message', async (req, res) => {
  const { number, message } = req.body

  try {
    if (!clientInstance) {
      throw new Error('Cliente não iniciado')
    }

    await clientInstance.sendText(number + '@c.us', message)
    res.status(200).send({ status: 'Message sent successfully' })
  } catch (error) {
    res.status(500).send({ status: 'Error sending message', error: error.message })
  }
})

app.get('/get-qrcode', async (req, res) => {
   if (qrCodeData ) {
    res.status(200).send({ qrCode: qrCodeData })
  } else {
    res.status(203).send({ message: 'QR code not available yet, please try again later.' })
  }
})

app.get('/status', async (req, res) => {
  try {
    if (!clientInstance) {
      throw new Error('Cliente não iniciado')
    }

    const isConnected = await clientInstance.isConnected()
    if (isConnected) {
      res.status(200).send({ status: 'Logged in' })
    } else {
      res.status(200).send({ status: 'Not logged in', qrCode: qrCodeData })
    }
  } catch (error) {
    res.status(500).send({ status: 500, error: error.message })
 
  }
})

app.get('/restart', async (req, res) => {
  try {
    await initializeVenom()
    res.status(200).send({ status: 'Venom-bot reiniciado com sucesso' })
  } catch (error) {
    res.status(500).send({ status: 'Erro ao reiniciar venom-bot', error: error.message })
  }
})

app.listen(7000)
