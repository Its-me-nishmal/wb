const { makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@fizzxydev/baileys-pro');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info'); // Store session credentials

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // We will manually handle QR code display
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrcode.generate(qr, { small: true }); // Display QR code in terminal
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed:', lastDisconnect?.error, 'Reconnecting:', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp(); // Reconnect if not logged out
            }
        } else if (connection === 'open') {
            console.log('Connected to WhatsApp!');
            sendHelloMessage(sock); // Call function to send a message
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

async function sendHelloMessage(sock) {
    const recipient = '917994107442@s.whatsapp.net'; // Replace with actual WhatsApp number
    // await sock.sendMessage(
    //     recipient,
    //     {
    //         text: "Hello",
    //         footer: "Footer Message",
    //         cards: [
    //            {
    //               image: { url: 'https://www.gemoo-resource.com/tools/img/image_urlgenerator_step3@2x.png' }, // or buffer,
    //               title: 'Title Cards',
    //               caption: 'Caption Cards',
    //               footer: 'Footer Cards',
    //               buttons: [
    //                   {
    //                       name: "quick_reply",
    //                       buttonParamsJson: JSON.stringify({
    //                          display_text: "Display Button",
    //                          id: "ID"
    //                       })
    //                   },
    //                   {
    //                       name: "cta_url",
    //                       buttonParamsJson: JSON.stringify({
    //                          display_text: "Display Button",
    //                          url: "https://www.example.com"
    //                       })
    //                   }
    //               ]
    //            }
    //         ]
    //     }
    // )
    await sock.sendAlbumMessage(
        recipient,
        [
           {
              image: { url: "https://www.gemoo-resource.com/tools/img/image_urlgenerator_step3@2x.png" }, // or buffer
              caption: "Hello World",
           },
           {
            image: { url: "https://www.gemoo-resource.com/tools/img/image_urlgenerator_step3@2x.png" }, // or buffer
            caption: "Hello World",
         },
         {
            image: { url: "https://www.gemoo-resource.com/tools/img/image_urlgenerator_step3@2x.png" }, // or buffer
            caption: "Hello World",
         }
        ],
        { 
          
           delay : 2000 // number in seconds
        }
    )
    console.log('Message sent: Hi Hello!');
}

connectToWhatsApp().catch(console.error);
