const client = require("../utility/db-connection");

const puppeteer = require('puppeteer');
// const chrome = require('chrome-aws-lambda');
const path = require("path");
const loginLinkedin = require("../utility/login-recruiter");
const sendRecruiterMessage = require("../utility/send-message-recruiter");
const launchBrowser = require("../utility/launch-browser");




const sendMessages = async (userIds, message, subject, followupMessage, followupSubject, period) => {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    await page.setViewport({
        width: 1800, // Width in pixels
        height: 1180, // Height in pixels
    });


    await loginLinkedin(page);

    await new Promise(resolve => setTimeout(resolve, 8000));

    sendRecruiterMessage(page, userIds, message, browser, period, subject, followupSubject, followupMessage);
    // page, userIds, message, browser, period, subject, followupSubject, followupMessage
};


const sendMessageAPI = async (req, res) => {
    const { queueId } = req.body;

    if (!queueId) {
        return res.status(400).send({ error: 'Invalid input: Provide queueId' });
    }

    const queueResult = await client.query('SELECT * FROM public.queue WHERE queueid = $1', [queueId]);
    const message = queueResult.rows[0].message
    const followupMessage = queueResult.rows[0].followupmessage
    const subject = queueResult.rows[0].subject
    const followupSubject = queueResult.rows[0].followupsubject
    const period = queueResult.rows[0].period

    const result = await client.query('SELECT userurn FROM public.queue_user WHERE queueid = $1', [queueId]);

    const browserStatus = await client.query(`Select * from browser`);
    if (browserStatus.rows[0].status == "RUNNING") return res.status(409).send({ status: 'Instance Already Running' });
    await client.query(`Update browser set status = 'RUNNING' where status = 'SLEEPING'`);


    const userIds = result.rows.map(row => row.userurn);
    // console.log(userIds)

    // Send the response immediately
    res.status(200).send({ status: 'Message sending started' });

    // Start sending messages
    await sendMessages(userIds, message, subject, followupMessage, followupSubject, period);


    console.log('All messages have been sent.');
}

module.exports = sendMessageAPI
