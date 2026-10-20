const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Serveur démarré et port ${PORT} ouvert sur Render`);
});

app.get('/', (req, res) => {
    res.status(200).send('Bot Shogi WhatsApp en ligne 24/7');
});

const myAdminNumber = "243854167858@c.us";

app.post('/api/nouveau-client', async (req, res) => {
    const { clientName } = req.body;
    if (clientName) {
        const message = `🚨 *Alerte Shogi Repacks*\nUn nouveau client vient d'entrer sur le site !\nPseudo : *${clientName}*`;
        try {
            if (global.whatsappClient) {
                await global.whatsappClient.sendMessage(myAdminNumber, message);
                res.status(200).json({ success: true });
            } else {
                res.status(500).json({ success: false, error: 'WhatsApp client not ready' });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(400).json({ success: false });
    }
});

const MONGO_URI = "mongodb+srv://severinvonga_db_user:PU2uDALXOEFQkigo@shogi.khxtztp.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI).then(() => {
    console.log('✅ Connecté à MongoDB pour le stockage de session');

    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            clientId: 'shogi-bot-session',
            backupSyncIntervalMs: 60000 // Sauvegarde périodique sur MongoDB
        }),
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

    global.whatsappClient = client;

    client.on('qr', (qr) => {
        console.log('--- SCANNEZ CE QR CODE VIA LE LIEN CI-DESSOUS ---');
        console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
    });

    client.on('ready', () => {
        console.log('✅ Bot WhatsApp connecté et prêt 24/7 !');
    });

    client.on('remote_session_saved', () => {
        console.log('💾 Session sauvegardée avec succès sur MongoDB Atlas !');
    });

    client.initialize();
}).catch(err => {
    console.error('Erreur de connexion MongoDB :', err);
});
