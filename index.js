'use strict';

const express = require('express');
const cors = require('cors');
const endpoints = require('express-endpoints');
const bodyParser = require('body-parser');
const gracefulShutdown = require('http-graceful-shutdown');
const agent = require('multiagent');

// Define some default values if not set in environment
const PORT = process.env.PORT || 3000;
const SHUTDOWN_TIMEOUT = process.env.SHUTDOWN_TIMEOUT || 10000;
const SERVICE_CHECK_HTTP = process.env.SERVICE_CHECK_HTTP || '/healthcheck';
const SERVICE_ENDPOINTS = process.env.SERVICE_ENDPOINTS || '/endpoints';
const DISCOVERY_SERVERS = process.env.DISCOVERY_SERVERS
  ? process.env.DISCOVERY_SERVERS.split(',')
  : ['http://???.???.???.001:8500', 'http://???.???.???.002:8500', 'http://???.???.???.003:8500'];

// Create a new express app
const app = express();

// Add CORS headers
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add health check endpoint
app.get(SERVICE_CHECK_HTTP, (req, res) => res.send({ uptime: process.uptime() }));

// Add metadata endpoint
app.get(SERVICE_ENDPOINTS, endpoints());

// Add all other service routes
app.post('/orders', (req, res) => {
    let products = req.body.products;
        
    let productList = '';

    for (let product of products) {
        productList = productList + product.title + '<br>';
    }

    sendMail(productList);
    res.status(201).end();
});



// Start the server
const server = app.listen(PORT, () => console.log(`Service listening on port ${PORT} ...`));

// Enable graceful server shutdown when process is terminated
gracefulShutdown(server, { timeout: SHUTDOWN_TIMEOUT });


function sendMail(productList)
{
    var nodemailer = require('nodemailer');

    // create reusable transporter object using the default SMTP transport 
    var transporter = nodemailer.createTransport('smtp://46.101.122.164:1025');

    // setup e-mail data with unicode symbols 
    var mailOptions = {
        from: '"Ulf" <ulf@spartakiade.org>', // sender address 
        to: 'lessmann.mobil@live.de', // list of receivers 
        subject: 'Ihre Bestellung bei uns', // Subject line 
        text: 'Ihre Bestellung wird jetzt bearbeitet' , // plaintext body 
        html: '<b>Ihre Bestellung wird jetzt bearbeitet</b><br>Ihre Bestellung<br><br>' + productList // html body 
    };

    // send mail with defined transport object 
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
}


// This is how you would use the discovery
// client to talk to other services:
//
// const client = agent.client({
//   discovery: 'consul',
//   discoveryServers: DISCOVERY_SERVERS,
//   serviceName: 'some-service'
// });

// client
//   .get('/healthcheck')
//   .then(res => console.log(res.body))
//   .catch(err => console.log(err));
