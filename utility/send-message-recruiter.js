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
                        const firstnameRegex = /\[firstname\]/g;
                        const lastnameRegex = /\[lastname\]/g;

                        // Replace placeholders for firstname and lastname
                        const formattedText = text
                            .replace(firstnameRegex, firstname || "[firstname]")
                            .replace(lastnameRegex, lastname || "[lastname]");

                        return formattedText;
                    };

                    const typeInContentEditable = async (element, text) => {
                        if (!element) return;
                        element.focus(); // Focus on the element

                        // Split text into chunks to handle URLs as <a> tags
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        const chunks = text.split(urlRegex);

                        for (let chunk of chunks) {
                            // If chunk is a URL, insert it as an <a> tag
                            if (urlRegex.test(chunk)) {
                                const linkHTML = `<a href="${chunk}" target="_blank" class="text-blue-500 underline">${chunk}</a>`;
                                document.execCommand("insertHTML", false, linkHTML);
                            } else {
                                // Otherwise, simulate typing each character
                                for (let char of chunk) {
                                    document.execCommand("insertText", false, char);
                                    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate delay between characters
                                }
                            }
                        }
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
                            console.error('Select number days element not found');
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
                        await typeText(inputElement[0], subject);

                        if (followupMessage || followupMessage != undefined) {
                            await new Promise(resolve => setTimeout(resolve, 20000)); // Wait for 20 seconds
                            await typeText(inputElement[1], followupSubject);
                        }
                    } else {
                        console.error('Input element not found');
                    }
                    await new Promise(resolve => setTimeout(resolve, 3000));

                    const inputBox = document.querySelectorAll(".ql-editor[contenteditable='true']");

                    if (inputBox.length > 0) {
                        inputBox[0].innerHTML = ""; // Clear existing content
                        await typeInContentEditable(inputBox[0], formatTextWithLinks(message, firstname, lastname));

                        if (followupMessage || followupMessage != undefined) {
                            await new Promise(resolve => setTimeout(resolve, 20000)); // Wait for 20 seconds
                            inputBox[1].innerHTML = ""; // Clear existing content
                            await typeInContentEditable(inputBox[1], formatTextWithLinks(followupMessage, firstname, lastname));
                        }
                    } else {
                        console.error("Input box not found");
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



