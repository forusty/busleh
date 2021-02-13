# WIP

Following codebase will need to be cleaned up eventually.

Currently deployed into Heroku free tier as usage is low.

- [x] Implement location based bus search
- [ ] Standardised Bus Objects and Bus Arrival as seperate class to cater for future enhancement to use different source
- [ ] Standardise LTA API call for future usage to switch source

# Prerequisite
* NodeJS : v14.15.4
* NPM : 6.14.10
* TELEGRAM_TOKEN (Get from bot father on telegram)
* LTA_API_KEY (Get from [Get from LTA Data Mall](https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html)

# Install required dependencies
```
npm install
```

# Before running
You need to set both`TELEGRAM_TOKEN` and `LTA_API_KEY` as environment variable

You can use the following command to set the environment variable for current session during development
```
SET LTA_API_KEY=<lta key>
SET TELEGRAM_TOKEN=<telegram token>
```

I set the above as a batch file that i run before running the bot server

# Running in Dev Mode

type 'npm start dev' or 'npm run start-dev' to run busleh in dev mode and it will read from the environemtn variable for the required tokens.

# Running in production

Ideally when you deploy it to a server like heroku, you are able to predefined the environment variable within the app management console.

In the case where there isn't such a feature then you would need to either set it on run up everytime you start the bot server or to configure the server to stored the tokens permanently.
