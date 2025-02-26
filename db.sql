CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Campaign Table
CREATE TABLE Campaign (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaignName VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() AT TIME ZONE 'Asia/Kolkata'
);

-- Create Users Table
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaignId UUID NOT NULL REFERENCES Campaign(id) ON DELETE CASCADE,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    location TEXT,
    headline TEXT,
    industryName TEXT,
    contactEmail VARCHAR(255),
    publicProfileUrl TEXT,
    educations JSONB,
    workExperience JSONB,
    userurn varchar(100),
    number NUMERIC
);


CREATE TABLE queue (
    queueId UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Automatically generates a UUID
    queue_name VARCHAR(255) NOT NULL,                  -- Name of the queue
    period VARCHAR(50),                       -- Period of the queue
    message TEXT NOT NULL,                              -- Message related to the queue
    subject TEXT NOT NULL,
    followupMessage TEXT,
    followupSubject TEXT
);

CREATE TABLE queue_user (
    userUrn VARCHAR(255) UNIQUE NOT NULL,             -- Unique identifier for the user
    queueId UUID NOT NULL REFERENCES queue(queueId),  -- Foreign key linking to the queue table
    username VARCHAR(255) NOT NULL,                   -- Username
    user_url TEXT,                                      -- URL associated with the user
    accept_status VARCHAR(255) NOT NULL
    
);

CREATE TABLE connection (
    connectionId UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Automatically generates a UUID
    connection_name VARCHAR(255) NOT NULL,                  -- Name of the queue
    message TEXT NOT NULL                              -- Message related to the queue
);


CREATE TABLE connection_user (
    userUrl VARCHAR(255) UNIQUE NOT NULL,             -- Unique identifier for the user
    connectionId UUID NOT NULL REFERENCES connection(connectionId),  -- Foreign key linking to the queue table
    username VARCHAR(255) NOT NULL,                   -- Username
    accept_status VARCHAR(255) NOT NULL  
);


CREATE TABLE whatsapp (
    whatsappId UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Automatically generates a UUID
    whatsapp_name VARCHAR(255) NOT NULL,                  -- Name of the queue
    message TEXT NOT NULL                              -- Message related to the queue
);


CREATE TABLE whatsapp_user (
    userNumber VARCHAR(255) UNIQUE NOT NULL,             -- Unique identifier for the user
    whatsappId UUID NOT NULL REFERENCES whatsapp(whatsappId),  -- Foreign key linking to the queue table
    username VARCHAR(255) NOT NULL,                   -- Username
    accept_status VARCHAR(255) NOT NULL  
);



CREATE TABLE email (
    emailId UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- Automatically generates a UUID
    email_name VARCHAR(255) NOT NULL,                  -- Name of the queue
    message TEXT NOT NULL                              -- Message related to the queue
);


CREATE TABLE email_user (
    userEmail VARCHAR(255) UNIQUE NOT NULL,             -- Unique identifier for the user
    emailId UUID NOT NULL REFERENCES email(emailId),  -- Foreign key linking to the queue table
    username VARCHAR(255) NOT NULL,                   -- Username
    accept_status VARCHAR(255) NOT NULL  
);



ALTER TABLE "public"."users" ADD COLUMN "number" NUMERIC;