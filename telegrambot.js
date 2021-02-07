var TelegramBot = require('node-telegram-bot-api');

module.exports = {
    /**
     * gets all users
     * @param callback
     */
    getBot: function(callback,mode) {
    	var bot;
    	if(mode !=='dev')
    	{
	        const TOKEN = process.env.TELEGRAM_TOKEN;
	        // See https://developers.openshift.com/en/node-js-environment-variables.html
	        const options = {
	            webHook: {
	                port: process.env.PORT,
	                host: process.env.IP,
	                // you do NOT need to set up certificates since OpenShift provides
	                // the SSL certs already (https://<app-name>.rhcloud.com)
	            },
	        };
	        // OpenShift routes from port :443 to OPENSHIFT_NODEJS_PORT
	        const domain = process.env.APP_DNS;
	        const url = `${domain}:443`;
	       	bot = new TelegramBot(TOKEN, options);

	        // This informs the Telegram servers of the new webhook.
	        // Note: we do not need to pass in the cert, as it already provided
	        bot.setWebHook(`${url}/bot${TOKEN}`);
    	}
    	else{
    		console.log("DEV MODE");
	        const TOKEN = process.env.TELEGRAM_TOKEN;
			// Setup polling way
			bot = new TelegramBot(TOKEN, {
			    polling: true
			});
    	}
		callback(bot);
    }
};