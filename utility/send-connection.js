const client = require("./db-connection");

const sendRecruiterConnection = async (page, userUrls, message, browser) => {
    console.log(userUrls)
    try {
        for (const userUrl of userUrls) {
            try {
                // Navigate to the user's profile
                const profileUrl = userUrl;
                console.log(`Navigating to ${profileUrl}`);
                await page.goto(profileUrl, { timeout: 10000 });

                await new Promise(resolve => setTimeout(resolve, 5000));

                const userResult = await client.query(`Select * from users where publicprofileurl = $1`, [userUrl]);
                const firstname = userResult.rows[0].firstname;
                const lastname = userResult.rows[0].lastname;

                // Wait for the input box
                // await page.waitForSelector(".ql-editor[contenteditable='true']", { timeout: 10000 });

                // Send the message
                await page.evaluate(async (message, firstname, lastname) => {

                    function delay(ms) {
                        return new Promise(resolve => setTimeout(resolve, ms));
                    }

                    const formatTextWithLinks = (text, firstname, lastname) => {
                        const firstnameRegex = /\[firstname\]/g;
                        const lastnameRegex = /\[lastname\]/g;

                        // Replace placeholders for firstname and lastname
                        const formattedText = text
                            .replace(firstnameRegex, firstname || "[firstname]")
                            .replace(lastnameRegex, lastname || "[lastname]");

                        return formattedText;
                    };

                    const typeText = async (element, text) => {
                        if (!element) return;
                        element.focus();  // Ensure the field is focused
                        element.value = ""; // Clear the existing value
                        element.dispatchEvent(new Event('input', { bubbles: true }));

                        for (let char of text) {
                            element.value += char;  // Append each character
                            element.dispatchEvent(new Event('input', { bubbles: true }));
                            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate typing delay
                        }
                    };

                    // Try direct "Connect" button
                    const connectButton = document.querySelector('button[aria-label^="Invite "]');
                    if (connectButton) {
                        connectButton.click();
                        await delay(2000); // Wait for popup to appear
                    }
                    // Click "Add a note"
                    const addNoteButton = document.querySelector('button[aria-label="Add a note"]');
                    if (addNoteButton) {
                        addNoteButton.click();
                        await delay(2000); // Wait for text area to appear
                    } else {
                        return console.log("Add a note button not found.");
                    }

                    // Type the custom message
                    const textArea = document.querySelector('textarea#custom-message');
                    if (textArea) {
                        await typeText(textArea, formatTextWithLinks(message, firstname, lastname));
                        // textArea.dispatchEvent(new Event("input", { bubbles: true })); // Ensure LinkedIn detects input
                        await delay(3000);
                    } else {
                        return console.log("Custom message textarea not found.");
                    }

                    // Click "Send Invitation" button
                    const sendButton = document.querySelector('button[aria-label="Send invitation"]');
                    if (sendButton) {
                        sendButton.click();
                        return console.log("Connection request sent!");
                    }

                    return console.log("Send Invitation button not found.");

                    await delay(6000);

                }, message, firstname, lastname);

                console.log(`Connection sent to user ID: ${userUrl}`);
                client.query(`UPDATE public.connection_user SET accept_status = $1 WHERE userurn = $2`, ["PENDING", userUrl]);

            } catch (error) {
                console.error(`Error sending message to user URL: ${userUrl}`, error);
            }

            // Wait 20 seconds before sending the next message
            console.log("Waiting 20 seconds before sending the next message...");
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