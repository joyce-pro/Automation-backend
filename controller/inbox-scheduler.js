

const puppeteer = require('puppeteer');
// const chrome = require('chrome-aws-lambda');
const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule');
const client = require('../utility/db-connection');
const checkInbox = require('../utility/check-inbox');
const launchBrowser = require('../utility/launch-browser');
const loginLinkedin = require('../utility/login-recruiter');

const userDataDir = path.resolve('./user-data');
const scheduledJobs = {};


// Function to capture API responses
const captureApiResponses = async () => {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);


    await page.setViewport({
        width: 1550, // Width in pixels
        height: 1000, // Height in pixels
    });

    const browserStatus = await client.query(`Select * from browser`);
    if (browserStatus.rows[0].status == "RUNNING") res.status(409).send({ status: 'Instance Already Running' });

    await client.query(`Update browser set status = 'RUNNING'`);

    await loginLinkedin(page);

    await checkInbox(page, browser);

};

// Controller to schedule a job
exports.scheduleJob = (req, res) => {
    const { jobName, startAfterDays } = req.body;

    if (!jobName || typeof startAfterDays !== 'number') {
        return res.status(400).send({ error: 'Invalid input. Provide jobName and startAfterDays.' });
    }

    const startTime = new Date(Date.now() + startAfterDays * 24 * 60 * 60 * 1000);
    const job = schedule.scheduleJob(startTime, async () => {
        console.log(`Executing job: ${jobName}`);
        await captureApiResponses();
        console.log(`Job ${jobName} completed.`);
    });

    scheduledJobs[jobName] = job;
    res.status(200).send({
        message: `Job "${jobName}" scheduled successfully.`,
        startTime,
    });
};

exports.checkInbox = (req, res) => {
    res.status(200).json("Good")
    captureApiResponses();
}

// Controller to list all scheduled jobs
exports.listScheduledJobs = (req, res) => {
    const jobs = Object.keys(scheduledJobs).map(jobName => ({
        jobName,
        nextInvocation: scheduledJobs[jobName].nextInvocation(),
    }));
    res.status(200).send(jobs);
};

