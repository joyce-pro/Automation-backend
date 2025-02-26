const loginLinkedin = async (page) => {
    const email = process.env.RECRUITER_EMAIL;
    const password = process.env.RECRUITER_PASSWORD;
    try {

        await page.goto('https://www.linkedin.com/login-cap', {
            // waitUntil: 'networkidle2',
            timeout: 60000
        });

        page.setDefaultTimeout(60000);

        // Check if already logged in
        if (page.url() === 'https://www.linkedin.com/feed/') {
            console.log('Already logged in!');
        } else {
            // Fill in the email and password fields if not logged in

            await page.click('#username', { clickCount: 3 });
            await page.keyboard.press('Backspace');
            await page.type('#username', email, { delay: 300 });
            await page.type('#password', password, { delay: 300 });

            // Click the login button
            await page.click('button[type="submit"]');

            // Wait for navigation after login
            await page.waitForNavigation({
                waitUntil: 'networkidle2',
            });
            await new Promise(resolve => setTimeout(resolve, 20000));

            console.log('Login successful and session saved!');
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
    return
}

module.exports = loginLinkedin
