const path = require("path");
const { default: puppeteer } = require("puppeteer");

const launchBrowser = async () => {
    try {
        const isLocal = process.env.ENVIORNMENT
        const options = isLocal == 'DEVELOPMENT'
            ? {
                headless: false,
                args: [
                    // "--no-sandbox",
                    // "--disable-setuid-sandbox",
                    "--start-maximized", // Opens Chrome in full screen
                    // "--start-fullscreen",
                    // "--window-size=1920,1080",
                    // '--display=:99',
                ],
                userDataDir: path.resolve('/user-data'), // Store session persistently
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






// const browser = await puppeteer.launch({
//     headless: "new",
//     args: [

//     ],
    
//     userDataDir: path.resolve('./user-data'),
// });
