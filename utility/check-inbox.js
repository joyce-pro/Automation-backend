const client = require("./db-connection");

const checkInbox = async (page, browser) => {
    try {
        const apiUrlPattern = 'https://www.linkedin.com/talent/api/graphql';
        await page.setRequestInterception(true);
        page.on('request', (request) => request.continue());

        page.on('response', async (response) => {
            try {
                const url = response.url();

                // Check if the URL contains the base API and the desired filter
                const filterKey = 'filter:INBOX';

                if (url.startsWith(apiUrlPattern) && url.includes(filterKey)) {
                    const responseData = await response.json();
                    responseData?.included?.forEach(async (item) => {
                        if (item["*participants"]) {
                            const userUr = item["*participants"][0]?.split(":").pop();
                            // console.log(userUr)
                            var result;
                            if (userUr) result =
                                // await client.query("select * from public.queue_user where userurn = $1", [userUr])
                                client.query("UPDATE public.queue_user SET accept_status = $1 WHERE userurn = $2", [item.requestState, userUr])
                            // console.log(item.requestState)
                        }

                        // console.log()
                        // 
                        // console.log(item["*participants"])
                    })

                    console.log(`Captured response for URL: ${url}`);
                    // fs.appendFileSync(
                    //     './api_responses.json',
                    //     JSON.stringify(responseData, null, 2) + '\n'
                    // );
                }
            } catch (error) {
                console.error('Error processing response:', error);
            }
        });

        // Navigate and scroll
        const inboxUrl = 'https://www.linkedin.com/talent/inbox'

        await new Promise(resolve => setTimeout(resolve, 8000));

        await page.goto('https://www.linkedin.com/talent/inbox', { waitUntil: 'networkidle2' });
        await page.evaluate(async () => {
            const scrollContainer = document.querySelector('div[class*="_conversations-container"]');
            if (!scrollContainer) return;

            let previousHeight = 0;
            let retries = 0;
            const maxRetries = 2;

            while (retries < maxRetries) {
                scrollContainer.scrollTo(0, scrollContainer.scrollHeight);
                const currentHeight = scrollContainer.scrollHeight;

                if (currentHeight === previousHeight) {
                    retries++;
                } else {
                    retries = 0;
                    previousHeight = currentHeight;
                }
                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        });
    } catch (error) {
        console.error('Error during scroll and capture:', error);
    } finally {
        await browser.close();
        await client.query(`Update browser set status = 'SLEEPING'`);
    }
    return;
}

module.exports = checkInbox;