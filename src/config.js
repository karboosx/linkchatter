var port = process.env.PORT || 3000;
var keySalt = process.env.APP_KEY || 'testowy';
var registerHistory = process.env.REGISTER_HISTORY || 'false';

if (registerHistory == 'true') registerHistory = true;
if (registerHistory == 'false') registerHistory = false;

var config = {
    keySalt:keySalt,
    registerHistory:registerHistory,
    port:port,
    databaseUrl:process.env.DATABASE_URL
};

module.exports = config;