const client = require("../utility/db-connection");


//Creation Of New Campaign that will hold the profiles scrapped by extension
const createCampaign = async (req, res) => {
    const data = { name: req.body.name };
    try {
        const result = await client.query(
            'INSERT INTO public.campaign (campaignname) VALUES ($1) RETURNING *',
            [data.name]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error creating campaign:", error);
        res.status(500).json({ error: "Error creating campaign." });
    }
};



//Retrieval Of Campaign that will hold the profiles scrapped by extension
const fetchCampaigns = async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM public.campaign');
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        res.status(500).json({ error: "Error fetching campaigns." });
    }
};



//Adding data in a single Campaign
const addData = async (req, res) => {
    const users = req.body; // Expecting an array of user objects

    if (!Array.isArray(users)) {
        return res.status(400).json({ error: "Input must be an array of user objects." });
    }

    try {
        for (const user of users) {
            const {
                dbId,
                firstName,
                lastName,
                location,
                educations,
                headline,
                industryName,
                contactEmail,
                publicProfileUrl,
                workExperience,
                userUrn,
            } = user;

            if (!firstName) continue;


            await client.query(
                `INSERT INTO public.users (campaignid, firstName, lastName, location, headline, industryName, contactEmail, publicProfileUrl, educations, workExperience, userUrn)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                    dbId,
                    firstName,
                    lastName,
                    location,
                    headline,
                    industryName,
                    contactEmail,
                    publicProfileUrl,
                    JSON.stringify(educations),
                    JSON.stringify(workExperience),
                    userUrn
                ]
            );
        }

        res.status(201).json({ message: "All data added successfully." });
    } catch (error) {
        console.error("Error inserting data:", error);
        res.status(500).json({ error: "Error inserting data." });
    }
};



//Retrieving the profiles related with a campaign
const fetchData = async (req, res) => {
    try {
        const id = req.params.dbId;
        const result = await client.query('SELECT * FROM public.users WHERE campaignid = $1', [id]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Error fetching data." });
    }
};

module.exports = {
    createCampaign,
    fetchCampaigns,
    addData,
    fetchData
};
