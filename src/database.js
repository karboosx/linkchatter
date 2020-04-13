var pg = require('pg');
var config = require('./config');

// views is directory for all template files

var pool = undefined;
var client= undefined;

var connect = function (config, callback) {

    pool = new pg.Client(config.databaseUrl);

    pool.connect(function(err, _client, done) {
        if (err) {
            console.error(err);
        }
        client = _client;
        if (typeof callback == 'function') {
            callback(pool, _client);
        }
    });

};
var query = function (sql, params, queryCallback) {
    if (pool == undefined || client == undefined){
        connect(config, function () {
            pool.query(sql, params, queryCallback);
        })
    }else{
        pool.query(sql, params, queryCallback);
    }
};

module.exports = {
    pool:pool,
    client:client,
    connect:connect,
    query:query,
};