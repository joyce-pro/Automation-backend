const client = require("./db-connection");

const sendRecruiterConnection = async (page, userUrls, message, browser) => {
    try {
        for (const userUrl of userUrls) {
            try {
                // Navigate to the user's profile
                const profileUrl = userUrl;
                console.log(`Navigating to ${profileUrl}`);
                await page.goto(profileUrl, { timeout: 10000 });

                await new Promise(resolve => setTimeout(resolve, 5000));

                let recruiterApiResponse = null;
                page.on("response", async (response) => {
                    const url = response.url();
                    if (
                        url.startsWith("https://www.linkedin.com/talent/api/talentLinkedInMemberProfiles/") &&
                        url.includes("altkey=urn") &&
                        url.includes("decoration")
                    ) {
                        try {
                            recruiterApiResponse = await response.json();
                            console.log("Captured Recruiter API Response:", recruiterApiResponse);
                        } catch (err) {
                            console.error("Error parsing response:", err);
                        }
                    }
                });


                const recruiterButtonClicked = await page.evaluate(() => {
                    const recruiterButton = document.querySelector('button[aria-label^="View "][aria-label*="profile in Recruiter"]');
                    if (recruiterButton) {
                        recruiterButton.click();
                        return "Recruiter button clicked.";
                    }
                    return "Recruiter button not found.";
                });

                console.log(recruiterButtonClicked);

                // Wait to ensure the API request is captured
                await page.waitForTimeout(5000);

                if (recruiterApiResponse) {
                    console.log("Final Extracted Data:", recruiterApiResponse);
                } else {
                    console.log("No recruiter profile API response captured.");
                }

                console.log(`Connection sent to user ID: ${userUrl}`);
            } catch (error) {
                console.error(`Error sending message to user URL: ${userUrl}`, error);
            }

            // Wait 20 seconds before sending the next message
            console.log("Waiting 20 seconds before sending the next message...");
            client.query(`UPDATE public.queue_user SET accept_status = $1 WHERE userurn = $2`, ["PENDING", userUrl]);
            await new Promise(resolve => setTimeout(resolve, 20000));
        }
    } catch (error) {
        console.error('Error in sending messages:', error);
    } finally {
        await browser.close();
        await client.query(`Update browser set status = 'SLEEPING'`);
    }
    return
}

module.exports = sendRecruiterConnection;