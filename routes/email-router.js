const express = require('express');
const connection = require('../controller/send-connection');
const { createWhatsapp, fetchWhatsapp, addToWhatsapp, addAllToWhatsapp, removeFromWhatsapp, fetchProfilesBywWhatsapp } = require('../controller/whatsapp-controller');
const { createEmail, fetchEmail, addToEmail, addAllToEmail, removeFromEmail, fetchProfilesByEmail, sendBulkEmails } = require('../controller/email-controller');
const router = express.Router();


router.post('/send', sendBulkEmails)
router.post('/create', createEmail);

// Route to fetch all campaigns
router.get('/fetch', fetchEmail);


// Route to add a user to the queue
router.post('/add', addToEmail);
router.post('/add/all', addAllToEmail);

//Route to remove from queue
router.delete('/delete/:useremail', removeFromEmail);

// Route to fetch the queue for a specific campaign
router.get('/fetch/:emailId', fetchProfilesByEmail);


module.exports = router;