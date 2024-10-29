const sgMail = require('@sendgrid/mail');

// Asegúrate de tener el archivo .env con tu API Key
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
    to: 'reinaldo@gmail.com', // Reemplaza con tu email verificado en SendGrid
    from: 'info@disu.app', // Reemplaza con tu email verificado en SendGrid
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

sgMail
    .send(msg)
    .then(() => {
        console.log('Email sent');
    })
    .catch((error) => {
        console.error(error);
    });
