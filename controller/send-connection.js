const client = require("../utility/db-connection");

const puppeteer = require('puppeteer');
// const chrome = require('chrome-aws-lambda');
const path = require("path");
const loginLinkedin = require("../utility/login-recruiter");
const sendRecruiterMessage = require("../utility/send-message-recruiter");
const launchBrowser = require("../utility/launch-browser");
const sendRecruiterConnection = require("../utility/send-connection");



const sendConnections = async (userUrls, message) => {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    await page.setViewport({
        width: 1800, // Width in pixels
        height: 1180, // Height in pixels
    });


    // await loginLinkedin(page);

    // await new Promise(resolve => setTimeout(resolve, 8000));

    sendRecruiterConnection(page, userUrls, message, browser);
    // page, userIds, message, browser, period, subject, followupSubject, followupMessage
};



exports.sendConnectionAPI = async (req, res) => {
    const { connectionId } = req.body;

    if (!connectionId) {
        return res.status(400).send({ error: 'Invalid input: Provide connectionId' });
    }

    const connectionResult = await client.query('SELECT * FROM public.connection WHERE connectionId = $1', [connectionId]);
    const message = connectionResult.rows[0].message

    const result = await client.query('SELECT userurl FROM public.connection_user WHERE connectionId = $1', [connectionId]);

    const browserStatus = await client.query(`Select * from browser`);
    if (browserStatus.rows[0].status == "RUNNING") return res.status(409).send({ status: 'Instance Already Running' });
    await client.query(`Update browser set status = 'RUNNING' where status = 'SLEEPING'`);


    const userUrl = result.rows.map(row => row.userurl);
    // console.log(userUrl)

    // Send the response immediately
    res.status(200).send({ status: 'Message sending started' });

    // Start sending messages
    await sendConnections(userUrl, message);


    console.log('All messages have been sent.');
}


exports.createConnection = async (req, res) => {
    const { connectionName, message } = req.body;
    // const queueId = `queue-${Date.now()}`; // Generate a unique queue ID

    // console.log(req.body)

    if (!connectionName || !message) {
        return res.status(400).json({ error: 'Connection name and message are required' });
    }

    try {
        const query = `
        INSERT INTO public.connection (connection_name, message)
        VALUES ($1, $2);
      `;
        const values = [connectionName, message];
        const result = await client.query(query, values);
        res.status(201).json({ message: 'Connection created successfully', connection: result.rows[0] });
    } catch (error) {
        console.error('Error creating connection:', error);
        res.status(500).json({ error: 'Failed to create connection' });
    }
};

// Fetch All queues
exports.fetchConnection = async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM public.connection');
        // console.log(result)
        res.status(200).json({ connections: result.rows });
    } catch (error) {
        console.error('Error fetching connections:', error);
        res.status(500).json({ error: 'Failed to fetch connections' });
    }
};


exports.addToConnection = async (req, res) => {
    const { connectionId, acceptStatus, userName, userUrl } = req.body;

    if (!connectionId || !userName || !userUrl) {
        return res.status(400).json({ error: 'Connection ID, userName and userUrl are required' });
    }

    try {
        const query = `
        INSERT INTO public.connection_user (accept_status, connectionid, username, userurl)
        VALUES ($1, $2, $3, $4) RETURNING *;
      `;
        const values = [acceptStatus, connectionId, userName, userUrl];
        const result = await client.query(query, values);
        res.status(201).json({ message: 'User added to connection successfully', userConnection: result.rows[0] });
    } catch (error) {
        console.error('Error adding user to connection:', error);
        res.status(500).json({ error: 'Failed to add user to connection' });
    }
};

exports.addAllToConnection = async (req, res) => {
    const campaignId = req.body.campaignId;
    const connectionId = req.body.connectionId
    if (!campaignId) return res.status(400).json({ error: 'Campaign Id is required' });
    try {
        const capignUsers = (await client.query(`Select * from users where campaignid = $1`, [campaignId])).rows;
        for (const user of capignUsers) {
            const accept_status = "UNRESOLVED";
            const username = user.firstname;
            const userurl = user.publicprofileurl;
            // console.log(user)
            await client.query(`
                INSERT INTO public.connection_user (accept_status, connectionid, username, userurl)
                VALUES ($1, $2, $3, $4) RETURNING *;
              `, [accept_status, connectionId, username, userurl])
        }

        res.status(201).json({ message: 'Users added to connection successfully' });
    }
    catch (error) {
        console.error('Error adding user to connection:', error);
        res.status(500).json({ error: 'Failed to add user to connection' });
    }
}

exports.removeFromConnection = async (req, res) => {
    const userUrl = req.body.userurl

    if (!userUrl) return res.status(400).json({ error: 'User Url is required' });
    try {
        await client.query(`DELETE FROM connection_user WHERE userUrl = $1`, [userUrl]);
        res.status(201).json({ message: 'Users removed from connection successfully' });
    }
    catch (error) {
        console.error('Error removing user from connection:', error);
        res.status(500).json({ error: 'Failed to remove user from connection' });
    }

}

// Fetch Queue by queue ID
exports.fetchProfilesByConnection = async (req, res) => {
    const { connectionId } = req.params;

    try {
        const result = await client.query('SELECT * FROM public.connection_user WHERE connectionID = $1', [connectionId]);
        res.status(200).json({ connection: result.rows });
    } catch (error) {
        console.error('Error fetching connection by connection ID:', error);
        res.status(500).json({ error: 'Failed to fetch connection' });
    }
};


// module.exports = sendConnectionAPI