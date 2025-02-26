const express = require('express');
const router = express.Router();
const {
    createCampaign,
    fetchCampaigns,
    addData,
    fetchData,
    addMultipleData
} = require('../controller/scrapper-backend');


// Camapaign Logic
router.post('/add-campaign', createCampaign);
router.get('/fetch-campaign', fetchCampaigns);


//Adding Data In Campaign And Fetching It
router.post('/add-data', addData);
router.post('/add-multiple-data', addMultipleData);
router.get('/fetch-data/:dbId', fetchData);

module.exports = router;
