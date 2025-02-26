const express = require('express');
const connection = require('../controller/send-connection');
const { createWhatsapp, fetchWhatsapp, addToWhatsapp, addAllToWhatsapp, removeFromWhatsapp, fetchProfilesByWhatsapp, sendMessagesToUsers } = require('../controller/whatsapp-controller');
const router = express.Router();


router.post('/send', sendMessagesToUsers);
router.post('/create', createWhatsapp);

// Route to fetch all campaigns
router.get('/fetch', fetchWhatsapp);


// Route to add a user to the queue
router.post('/add', addToWhatsapp);
router.post('/add/all', addAllToWhatsapp);

//Route to remove from queue
router.delete('/delete/:usernumber', removeFromWhatsapp);

// Route to fetch the queue for a specific campaign
router.get('/fetch/:whatsappId', fetchProfilesByWhatsapp);


module.exports = router;