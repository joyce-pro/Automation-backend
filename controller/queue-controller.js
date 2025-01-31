const client = require("../utility/db-connection");

exports.createQueue = async (req, res) => {
    const { queueName, message, period, followupMessage, subject, followupSubject } = req.body;
    // const queueId = `queue-${Date.now()}`; // Generate a unique queue ID

    // console.log(req.body)

    if (!queueName || !message || !subject) {
        return res.status(400).json({ error: 'queue name and message are required' });
    }

    try {
        const query = `
        INSERT INTO public.queue (queue_name, message, period, followupmessage, subject, followupsubject)
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
        const values = [queueName, message, period, followupMessage, subject, followupSubject];
        const result = await client.query(query, values);
        res.status(201).json({ message: 'queue created successfully', queue: result.rows[0] });
    } catch (error) {
        console.error('Error creating queue:', error);
        res.status(500).json({ error: 'Failed to create queue' });
    }
};

// Fetch All queues
exports.fetchQueues = async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM public.queue');
        res.status(200).json({ queues: result.rows });
    } catch (error) {
        console.error('Error fetching queues:', error);
        res.status(500).json({ error: 'Failed to fetch queues' });
    }
};





exports.addToQueue = async (req, res) => {
    const { userUrn, queueId, acceptStatus, userName, userUrl } = req.body;

    if (!userUrn || !queueId || !userName || !userUrl) {
        return res.status(400).json({ error: 'User URN, queue ID, userName and userUrl are required' });
    }

    try {
        const query = `
        INSERT INTO public.queue_user (userurn, accept_status, queueid, username, user_url)
        VALUES ($1, $2, $3, $4, $5) RETURNING *;
      `;
        const values = [userUrn, acceptStatus, queueId, userName, userUrl];
        const result = await client.query(query, values);
        res.status(201).json({ message: 'User added to queue successfully', userQueue: result.rows[0] });
    } catch (error) {
        console.error('Error adding user to queue:', error);
        res.status(500).json({ error: 'Failed to add user to queue' });
    }
};

exports.addAllToQueue = async (req, res) => {
    const campaignId = req.body.campaignId;
    const queueId = req.body.queueId
    if (!campaignId) return res.status(400).json({ error: 'Campaign Id is required' });
    try {
        const capignUsers = (await client.query(`Select * from users where campaignid = $1`, [campaignId])).rows;
        for (const user of capignUsers) {
            const userurn = user.userurn;
            const accept_status = "UNRESOLVED";
            const username = user.firstname;
            const userurl = user.publicprofileurl;
            // console.log(user)
            await client.query(`
                INSERT INTO public.queue_user (userurn, accept_status, queueid, username, user_url)
                VALUES ($1, $2, $3, $4, $5) RETURNING *;
              `, [userurn, accept_status, queueId, username, userurl])
        }

        res.status(201).json({ message: 'Users added to queue successfully' });
    }
    catch (error) {
        console.error('Error adding user to queue:', error);
        res.status(500).json({ error: 'Failed to add user to queue' });
    }
}

exports.removeFromQueue = async (req, res) => {
    const userUrn = req.params.userurn

    if (!userUrn) return res.status(400).json({ error: 'User Urn is required' });
    try {
        await client.query(`DELETE FROM queue_user WHERE userUrn = $1`, [userUrn]);
        res.status(201).json({ message: 'Users removed from queue successfully' });
    }
    catch (error) {
        console.error('Error removing user from queue:', error);
        res.status(500).json({ error: 'Failed to remove user from queue' });
    }

}

// Fetch Queue by queue ID
exports.fetchProfilesByQueue = async (req, res) => {
    const { queueId } = req.params;

    try {
        const result = await client.query('SELECT * FROM public.queue_user WHERE queueID = $1', [queueId]);
        res.status(200).json({ queue: result.rows });
    } catch (error) {
        console.error('Error fetching queue by queue ID:', error);
        res.status(500).json({ error: 'Failed to fetch queue' });
    }
};