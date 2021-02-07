# Running

type 'npm install' to install all the required dependencies before running project for the first time.

# Set API Token
SET LTA_API_KEY=
SET TELEGRAM_TOKEN=

# Running in Dev Mode

type 'npm start dev' or 'npm run start-dev' to run busleh in dev mode where it is using hardcoded token file

# Running in Production Mode

type 'npm start' to run busleh in live mode where it is using environment variable TELEGRAM_TOKEN

To set environment variable in linux type the following

SET TELEGRAM_TOKEN=<your token here>

For openshift

rhc env set <Variable>=<Value> <Variable2>=<Value2> -a App_Name
