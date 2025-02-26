const client = require("../utility/db-connection");
const AWS = require("aws-sdk");

exports.createEmail = async (req, res) => {
    const { emailName, message } = req.body;


    if (!emailName || !message) {
        return res.status(400).json({ error: 'email name and message are required' });
    }

    try {
        const query = `
        INSERT INTO public.email (email_name, message)
        VALUES ($1, $2);
      `;
        const values = [emailName, message];
        const result = await client.query(query, values);
        res.status(201).json({ message: 'email created successfully', email: result.rows[0] });
    } catch (error) {
        console.error('Error creating email:', error);
        res.status(500).json({ error: 'Failed to create email' });
    }
};

// Fetch All emails
exports.fetchEmail = async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM public.email');
        // console.log(result)
        res.status(200).json({ emails: result.rows });
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
};


exports.addToEmail = async (req, res) => {
    const { emailId, acceptStatus, userName, useremail } = req.body;

    if (!emailId || !userName || !useremail) {
        return res.status(400).json({ error: 'email ID, userName and useremail are required' });
    }

    try {
        const query = `
        INSERT INTO public.email_user (accept_status, emailid, username, useremail)
        VALUES ($1, $2, $3, $4) RETURNING *;
      `;
        const values = [acceptStatus, emailId, userName, useremail];
        const result = await client.query(query, values);
        res.status(201).json({ message: 'User added to email successfully', useremail: result.rows[0] });
    } catch (error) {
        console.error('Error adding user to email:', error);
        res.status(500).json({ error: 'Failed to add user to email' });
    }
};

exports.addAllToEmail = async (req, res) => {
    const campaignId = req.body.campaignId;
    const emailId = req.body.emailId
    if (!campaignId) return res.status(400).json({ error: 'Campaign Id is required' });
    try {
        const capignUsers = (await client.query(`Select * from users where campaignid = $1`, [campaignId])).rows;
        for (const user of capignUsers) {
            const accept_status = "UNRESOLVED";
            const username = user.firstname;
            const useremail = user.contactemail;
            if (!useremail || useremail == null) continue;
            // console.log(user)
            await client.query(`
                INSERT INTO public.email_user (accept_status, emailid, username, useremail)
                VALUES ($1, $2, $3, $4) 
                ON CONFLICT (useremail) DO NOTHING 
                RETURNING *;
              `, [accept_status, emailId, username, useremail])
        }

        res.status(201).json({ message: 'Users added to email successfully' });
    }
    catch (error) {
        console.error('Error adding user to email:', error);
        res.status(500).json({ error: 'Failed to add user to email' });
    }
}

exports.removeFromEmail = async (req, res) => {
    const useremail = req.params.useremail

    if (!useremail) return res.status(400).json({ error: 'User Number is required' });
    try {
        await client.query(`DELETE FROM email_user WHERE useremail = $1`, [useremail]);
        res.status(201).json({ message: 'Users removed from email successfully' });
    }
    catch (error) {
        console.error('Error removing user from email:', error);
        res.status(500).json({ error: 'Failed to remove user from email' });
    }

}

// Fetch email by email ID
exports.fetchProfilesByEmail = async (req, res) => {
    const { emailId } = req.params;

    try {
        const result = await client.query('SELECT * FROM public.email_user WHERE emailID = $1', [emailId]);
        res.status(200).json({ email: result.rows });
    } catch (error) {
        console.error('Error fetching email by email ID:', error);
        res.status(500).json({ error: 'Failed to fetch email' });
    }
};


const SES_CONFIG = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
};


const AWS_SES = new AWS.SES(SES_CONFIG);


const sendEmail = (recipientEmail, name) => {
    let params = {
        Source: process.env.SES_EMAIL, // Verified email in SES
        Destination: {
            ToAddresses: [recipientEmail],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `<p>Hello ${name},</p><p>This is a test email from AWS SES.</p>`,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: `Hello, ${name}!`,
            },
        },
    };

    return AWS_SES.sendEmail(params).promise();
};



const sendTemplateEmail = (recipientEmail, name) => {
    let params = {
        Source: process.env.SES_EMAIL,
        Template: process.env.SES_TEMPLATE_NAME, // Set in .env
        Destination: {
            ToAddresses: [recipientEmail],
        },
        TemplateData: JSON.stringify({ name: name }),
    };

    return AWS_SES.sendTemplatedEmail(params).promise();
};

// Function to fetch users from PostgreSQL and send emails
exports.sendBulkEmails = async (req, res) => {
    const emailid = req.body.emailid
    try {
        const { rows: users } = await client.query("SELECT useremail, username FROM email_user WHERE emailid = $1", [emailid]);

        if (!users.length) {
            console.log("No subscribed users found.");
            return;
        }

        for (const user of users) {
            await sendEmail(user.useremail, user.username);
            console.log(`Email sent to: ${user.useremail}`);
        }
    } catch (error) {
        console.error("Error sending emails:", error);
    }
};