const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode'); // Utilisation du générateur de QR code classique
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Génère un lien de visualisation propre dans les logs au lieu des blocs de texte
client.on('qr', (qr) => {
    console.log('--- SCANNEZ CE QR CODE VIA LE LIEN CI-DESSOUS ---');
    qrcode.toDataURL(qr, (err, url) => {
        if (!err) {
            console.log(`Ouvrez ce lien dans votre navigateur pour voir le QR code : https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
        }
    });
});

client.on('ready', () => {
    console.log('✅ Bot WhatsApp connecté et prêt !');
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
