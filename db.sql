CREATE TABLE queue (
    queueId UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Automatically generates a UUID
    queue_name VARCHAR(255) NOT NULL,                  -- Name of the queue
    period VARCHAR(50),                       -- Period of the queue
    message TEXT NOT NULL                              -- Message related to the queue
    subject TEXT NOT NULL
    followupMessage TEXT
    followupSubject TEXT
);

CREATE TABLE queue_user (
    userUrn VARCHAR(255) UNIQUE NOT NULL,             -- Unique identifier for the user
    queueId UUID NOT NULL REFERENCES queue(queueId),  -- Foreign key linking to the queue table
    username VARCHAR(255) NOT NULL,                   -- Username
    uses_url TEXT                                      -- URL associated with the user
    accept_status VARCHAR(255) NOT NULL,
    
);