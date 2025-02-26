
const client = require("../utility/db-connection");

exports.saveCSVUsers = async (req, res) => {
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