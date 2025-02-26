const client = require("../utility/db-connection");
const axios = require('axios')

exports.createWhatsapp = async (req, res) => {
    const { whatsappName, message } = req.body;


    if (!whatsappName || !message) {
        return res.status(400).json({ error: 'whatsapp name and message are required' });
    }

    try {
        const query = `
        INSERT INTO public.whatsapp (whatsapp_name, message)
        VALUES ($1, $2);
      `;
        const values = [whatsappName, message];
        const result = await client.query(query, values);
        res.status(201).json({ message: 'whatsapp created successfully', whatsapp: result.rows[0] });
    } catch (error) {
        console.error('Error creating whatsapp:', error);
        res.status(500).json({ error: 'Failed to create whatsapp' });
    }
};

// Fetch All whatsapps
exports.fetchWhatsapp = async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM public.whatsapp');
        // console.log(result)
        res.status(200).json({ whatsapps: result.rows });
    } catch (error) {
        console.error('Error fetching whatsapps:', error);
        res.status(500).json({ error: 'Failed to fetch whatsapps' });
    }
};


exports.addToWhatsapp = async (req, res) => {
    const { whatsappId, acceptStatus, userName, userNumber } = req.body;

    if (!whatsappId || !userName || !userNumber) {
        return res.status(400).json({ error: 'whatsapp ID, userName and userNumber are required' });
    }

    try {
        const query = `
        INSERT INTO public.whatsapp_user (accept_status, whatsappid, username, usernumber)
        VALUES ($1, $2, $3, $4) RETURNING *;
      `;
        const values = [acceptStatus, whatsappId, userName, userNumber];
        const result = await client.query(query, values);
        res.status(201).json({ message: 'User added to whatsapp successfully', userwhatsapp: result.rows[0] });
    } catch (error) {
        console.error('Error adding user to whatsapp:', error);
        res.status(500).json({ error: 'Failed to add user to whatsapp' });
    }
};

exports.addAllToWhatsapp = async (req, res) => {
    const campaignId = req.body.campaignId;
    const whatsappId = req.body.whatsappId
    if (!campaignId) return res.status(400).json({ error: 'Campaign Id is required' });
    try {
        const capignUsers = (await client.query(`Select * from users where campaignid = $1`, [campaignId])).rows;
        for (const user of capignUsers) {
            const accept_status = "UNRESOLVED";
            const username = user.firstname;
            const usernumber = user.number;
            console.log(usernumber)
            if (usernumber == null || !usernumber) continue;
            // console.log(user)
            await client.query(`
                INSERT INTO public.whatsapp_user (accept_status, whatsappid, username, userNumber)
                VALUES ($1, $2, $3, $4) 
                ON CONFLICT (userNumber) DO NOTHING
                RETURNING *;
              `, [accept_status, whatsappId, username, usernumber])
        }

        res.status(201).json({ message: 'Users added to whatsapp successfully' });
    }
    catch (error) {
        console.error('Error adding user to whatsapp:', error);
        res.status(500).json({ error: 'Failed to add user to whatsapp' });
    }
}

exports.removeFromWhatsapp = async (req, res) => {
    const userNumber = req.params.usernumber

    if (!userNumber) return res.status(400).json({ error: 'User Number is required' });
    try {
        await client.query(`DELETE FROM whatsapp_user WHERE userNumber = $1`, [userNumber]);
        res.status(201).json({ message: 'Users removed from whatsapp successfully' });
    }
    catch (error) {
        console.error('Error removing user from whatsapp:', error);
        res.status(500).json({ error: 'Failed to remove user from whatsapp' });
    }

}

// Fetch whatsapp by whatsapp ID
exports.fetchProfilesByWhatsapp = async (req, res) => {
    const { whatsappId } = req.params;

    try {
        const result = await client.query('SELECT * FROM public.whatsapp_user WHERE whatsappID = $1', [whatsappId]);
        res.status(200).json({ whatsapp: result.rows });
    } catch (error) {
        console.error('Error fetching whatsapp by whatsapp ID:', error);
        res.status(500).json({ error: 'Failed to fetch whatsapp' });
    }
};









const sendWhatsAppMessage = async (phone) => {
    const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0";
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const TEMPLATE_NAME = "hello_world"; // Replace with your template name
    const LANGUAGE_CODE = "en_US";
    // console.log(phone);
    try {
        const response = await axios.post(
            `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: '+91' + phone,
                type: "template",
                template: {
                    name: TEMPLATE_NAME,
                    language: { code: LANGUAGE_CODE }
                }
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(`Error sending message to ${phone}:`, error.response?.data || error.message);
        return null;
    }
};


exports.sendMessagesToUsers = async (req, res) => {
    const whatsappid = req.body.whatsappid
    try {
        // Fetch active users from database
        const result = await client.query("SELECT usernumber FROM whatsapp_user WHERE whatsappid = $1", [whatsappid]);
        const users = result.rows;

        if (!users.length) {
            return res.status(404).json({ message: "No active users found." });
        }

        // Send messages to all users in parallel
        const sendResults = await Promise.all(users.map(user => sendWhatsAppMessage(user.usernumber)));

        res.status(200).json({ success: true, results: sendResults });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};