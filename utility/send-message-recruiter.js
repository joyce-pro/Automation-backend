const client = require("./db-connection");

const sendRecruiterMessage = async (page, userIds, message, browser, period, subject, followupSubject, followupMessage) => {
    try {
        for (const userId of userIds) {
            try {
                // Navigate to the user's profile
                const profileUrl = `https://www.linkedin.com/talent/profile/${userId}?rightRail=composer`;
                console.log(`Navigating to ${profileUrl}`);
                await page.goto(profileUrl, { timeout: 10000 });

                await new Promise(resolve => setTimeout(resolve, 5000));

                const userResult = await client.query(`Select * from users where userurn = $1`, [userId]);
                const firstname = userResult.rows[0].firstname;
                const lastname = userResult.rows[0].lastname;

                // Wait for the input box
                // await page.waitForSelector(".ql-editor[contenteditable='true']", { timeout: 10000 });

                // Send the message
                await page.evaluate(async (message, period, subject, followupSubject, followupMessage, firstname, lastname) => {


                    const formatTextWithLinks = (text, firstname, lastname) => {
                        // Regular expression to detect URLs
                        const urlRegex = /(https?:\/\/[^\s]+)/g;

                        // Regular expressions to detect [firstname] and [lastname] placeholders
                        const firstnameRegex = /\[firstname\]/g;
                        const lastnameRegex = /\[lastname\]/g;

                        // Escape text into HTML and replace placeholders
                        const formattedText = text
                            .split('\n') // Split by line breaks
                            .map((line) => {
                                // Replace URLs with anchor tags
                                const lineWithLinks = line.replace(
                                    urlRegex,
                                    (url) => `<a href="${url}" target="_blank" class="text-blue-500 underline">${url}</a>`
                                );

                                // Replace [firstname] with the provided firstname parameter
                                const lineWithFirstname = lineWithLinks.replace(
                                    firstnameRegex,
                                    firstname || "[firstname]" // Fallback to [firstname] if no firstname is provided
                                );

                                // Replace [lastname] with the provided lastname parameter
                                const lineWithLastname = lineWithFirstname.replace(
                                    lastnameRegex,
                                    lastname || "[lastname]" // Fallback to [lastname] if no lastname is provided
                                );

                                return `<p>${lineWithLastname}</p>`; // Wrap each line in a <p> tag
                            })
                            .join(''); // Combine lines back into a single string

                        return formattedText;
                    };



                    await new Promise(resolve => setTimeout(resolve, 2000));

                    if (followupMessage || followupMessage != undefined) {

                        const addButton = document.querySelector('button[aria-label="Add a followup message Send automatically if no reply from the initial message."]');
                        if (addButton) {
                            addButton.click();
                        } else {
                            console.error('First button with specified aria-label not found');
                        }

                        await new Promise(resolve => setTimeout(resolve, 3000));

                        const numDaysButton = document.querySelectorAll('button[aria-label="Update message trigger conditions"]');
                        if (numDaysButton[1]) {
                            numDaysButton[1].click(); // Click the button
                        } else {
                            console.error('Button with aria-label "Update message trigger conditions" not found');
                        }

                        await new Promise(resolve => setTimeout(resolve, 2000));

                        const numDaysSelect = document.querySelector('select.trigger-conditions-modal__select-dropdown.trigger-conditions-modal__time-units');
                        if (numDaysSelect) {
                            numDaysSelect.value = period; // Set the value to "4"
                            numDaysSelect.dispatchEvent(new Event('change'));
                        } else {
                            console.error('Select element not found');
                        }

                        await new Promise(resolve => setTimeout(resolve, 4000));


                        const buttons = Array.from(document.querySelectorAll('button.artdeco-button'));
                        const saveButton = buttons.find(button => button.textContent.trim() === 'Save');

                        if (saveButton) {
                            saveButton.click(); // Click the button with "Save" text
                        } else {
                            console.error('Button with text "Save" not found');
                        }
                    }

                    await new Promise(resolve => setTimeout(resolve, 2000));

                    const inputElement = document.querySelectorAll('input[aria-label="Message subject"]');
                    if (inputElement) {
                        inputElement[0].value = subject; // Set the desired value
                        inputElement[0].dispatchEvent(new Event('input', { bubbles: true }));
                        if (followupMessage || followupMessage != undefined) {
                            inputElement[1].value = followupSubject; // Set the desired value
                            inputElement[1].dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    } else {
                        console.error('Input element not found');
                    }


                    const inputBox = document.querySelectorAll(".ql-editor[contenteditable='true']");
                    inputBox[0].innerHTML = ""; // Clear existing content
                    inputBox[0].innerHTML = formatTextWithLinks(message, firstname, lastname); // Insert the message
                    if (followupMessage || followupMessage != undefined) {
                        inputBox[1].innerHTML = ""; // Clear existing content
                        inputBox[1].innerHTML = formatTextWithLinks(followupMessage, firstname, lastname); // Insert the message
                    }
                    await new Promise(resolve => setTimeout(resolve, 6000));
                    // Find and click the send button
                    const sendButton =
                        document.querySelector('button[role="button"][aria-label="Send this message"]') ||
                        Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.trim() === "Send") ||
                        document.querySelector('button[data-live-test-messaging-submit-btn]');


                    if (sendButton) {
                        sendButton.click(); // Simulate a click
                        console.log("Message sent!");
                    } else {
                        console.error("Send button not found!");
                    }



                }, message, period, subject, followupSubject, followupMessage, firstname, lastname);

                console.log(`Message sent to user ID: ${userId}`);
            } catch (error) {
                console.error(`Error sending message to user ID: ${userId}`, error);
            }

            // Wait 20 seconds before sending the next message
            console.log("Waiting 20 seconds before sending the next message...");
            client.query(`UPDATE public.queue_user SET accept_status = $1 WHERE userurn = $2`, ["PENDING", userId]);
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

module.exports = sendRecruiterMessage;



