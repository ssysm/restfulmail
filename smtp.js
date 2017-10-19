var mailin = require('mailin');
var mongojs = require('mongojs');
var db = mongojs(require('./config/db'), ['restfulmail']);
var mailCollection = db.collection('inbound');
mailin.start({
    port: 587,
    logFile: './log/smtp/log',
    logLevel: 'info',
    disableWebhook: true // Disable the webhook posting.
});
mailin.on('message', function (connection, data, content) {
    mailCollection.save(data,(err,docs)=>{
        if(err){
            console.log(err)
        }
        console.log(docs)
    })
});
mailin.on('error',(err)=>{
    "use strict";
    if(err){
        console.log(err)
    }
})