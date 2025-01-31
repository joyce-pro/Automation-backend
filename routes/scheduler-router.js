const express = require('express');
const router = express.Router();
// const jobController = require('../controllers/jobController');
const { checkInbox } = require('../controller/inbox-scheduler');

// Route to schedule a job

router.get('/getFeed', checkInbox)

module.exports = router;
