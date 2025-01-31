require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');
const client = require('./utility/db-connection');
const router = require('./routes/extension-router');
const queue = require('./routes/queue-router');
const message = require('./routes/inbox-router');
const inbox = require('./routes/scheduler-router');

const app = express();
const port = process.env.PORT;

const extensionURL = process.env.EXTENSION_URL;
const frontendURL = process.env.FRONTEND_URL;


// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(
    cors({
        origin: '*', // Your frontend's origin
        credentials: true, // Allow cookies to be sent with requests
    })
);



// Connection To Backend
client.connect().then((res) => { console.log("Sucessfully Connected To DB") }).catch((err) => { console.log(err) });



// Health Check
app.get('/health-check', (req, res) => {
    res.send("working fine");
})


//Extension Related Routes
app.use('/extension/', router);
app.use('/queue', queue);
app.use('/message', message);
app.use('/inbox', inbox)



// Initialize server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});


// AWS Lambda Expose
module.exports.handler = serverless(app);
