const express = require('express');
const sendMessageAPI = require('../controller/send-messages');
const { checkInbox } = require('../controller/inbox-scheduler');
const router = express.Router();


router.use('/sendMessage', sendMessageAPI);

// router.get('/check-message', checkInbox())

module.exports = router;