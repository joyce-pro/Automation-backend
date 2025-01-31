const express = require('express');
const { createQueue, fetchQueues, addToQueue, fetchProfilesByQueue, addAllToQueue, removeFromQueue } = require('../controller/queue-controller');
const router = express.Router();


router.post('/create', createQueue);

// Route to fetch all campaigns
router.get('/fetch', fetchQueues);


// Route to add a user to the queue
router.post('/add', addToQueue);
router.post('/add/all', addAllToQueue);

//Route to remove from queue
router.delete('/delete/:userurn', removeFromQueue);

// Route to fetch the queue for a specific campaign
router.get('/fetch/:queueId', fetchProfilesByQueue);

module.exports = router