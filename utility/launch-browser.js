const path = require("path");
const { default: puppeteer } = require("puppeteer");

const launchBrowser = async () => {
    try {
        const isLocal = true
        const options = isLocal
            ? {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                // executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null, // Local Chrome path
                userDataDir: path.resolve('./user-data'), // Local directory for persistent data
            }
            : {
                // args: [...chrome.args, '--no-sandbox', '--disable-setuid-sandbox'],
                // executablePath: await chrome.executablePath,
                // headless: chrome.headless,
                userDataDir: '/tmp/user-data', // Use /tmp for AWS environments
            };

        return puppeteer.launch(options);
    }
    catch (err) {
        console.log(err);
    }
};

module.exports = launchBrowser
