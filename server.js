const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configuration de LocalAuth avec un clientId fixe pour garder la session active sur Render
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'shogi-bot-session' }),
    puppeteer: {
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('--- SCANNEZ CE QR CODE VIA LE LIEN CI-DESSOUS ---');
    qrcode.toDataURL(qr, (err, url) => {
        if (!err) {
            console.log(`Ouvrez ce lien dans votre navigateur pour voir le QR code : https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
        }
    });
});

client.on('ready', () => {
    console.log('✅ Bot WhatsApp connecté et prêt 24/7 !');
});

// Reconnexion automatique en cas de coupure de session
client.on('disconnected', (reason) => {
    console.log('⚠️ Bot déconnecté, tentative de reconnexion...', reason);
    client.initialize();
});

client.initialize();

const myAdminNumber = "243854167858@c.us";

app.post('/api/nouveau-client', async (req, res) => {
    const { clientName } = req.body;
    if (clientName) {
        const message = `🚨 *Alerte Shogi Repacks*\nUn nouveau client vient d'entrer sur le site !\nPseudo : *${clientName}*`;
        try {
            await client.sendMessage(myAdminNumber, message);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(400).json({ success: false });
    }
});

// Route de santé (essentielle pour UptimeRobot afin d'empêcher Render de s'endormir)
app.get('/', (req, res) => {
    res.status(200).send('Bot Shogi WhatsApp en ligne 24/7');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
