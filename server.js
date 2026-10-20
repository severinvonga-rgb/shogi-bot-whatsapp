const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcode = require('qrcode');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Votre URI MongoDB Atlas avec vos identifiants
const MONGO_URI = "mongodb+srv://severinvonga_db_user:PU2uDALXOEFQkigo@shogi.khxtztp.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI).then(() => {
    console.log('✅ Connecté à MongoDB pour le stockage de session');

    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            clientId: 'shogi-bot-session',
            backupSyncIntervalMs: 300000 // Sauvegarde automatique toutes les 5 minutes
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

    client.on('remote_session_saved', () => {
        console.log('💾 Session sauvegardée avec succès sur MongoDB !');
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

    app.get('/', (req, res) => {
        res.status(200).send('Bot Shogi WhatsApp en ligne 24/7');
    });

    const PORT = process.env.PORT || 10000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Serveur démarré sur le port ${PORT}`);
    });
}).catch(err => {
    console.error('Erreur de connexion MongoDB :', err);
});
