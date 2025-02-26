const express = require('express');
const connection = require('../controller/send-connection');
const router = express.Router();


router.post('/send', connection.sendConnectionAPI)
router.post('/create', connection.createConnection);

// Route to fetch all campaigns
router.get('/fetch', connection.fetchConnection);


// Route to add a user to the queue
router.post('/add', connection.addToConnection);
router.post('/add/all', connection.addAllToConnection);

//Route to remove from queue
router.post('/delete', connection.removeFromConnection);

// Route to fetch the queue for a specific campaign
router.get('/fetch/:connectionId', connection.fetchProfilesByConnection);


module.exports = router;