"use strict"

var hello = require('./hello/main.js');
var app = hello;
var caf_core = require('caf_core');
var myUtils = caf_core.caf_components.myUtils;
var async = caf_core.async;
var cli = caf_core.caf_cli;

var CA_OWNER_1='smsother1';
var CA_LOCAL_NAME_1='bar1';
var FROM_1 =  CA_OWNER_1 + '-' + CA_LOCAL_NAME_1;

var config = {};

// api key of the Nexmo API
config.api_key = process.env['API_KEY'];

// api_secret of the Nexmo API
config.api_secret = process.env['API_SECRET'];

// phone number of sender registered with Nexmo
config.from = parseInt(process.env['FROM']);

// phone number receiving the message
var to = parseInt(process.env['TO']);

process.on('uncaughtException', function (err) {
               console.log("Uncaught Exception: " + err);
               console.log(myUtils.errToPrettyStr(err));
               process.exit(1);

});

module.exports = {
    setUp: function (cb) {
       var self = this;
        app.init( {name: 'top'}, 'framework.json', null,
                      function(err, $) {
                          if (err) {
                              console.log('setUP Error' + err);
                              console.log('setUP Error $' + $);
                              // ignore errors here, check in method
                              cb(null);
                          } else {
                              self.$ = $;
                               cb(err, $);
                          }
                      });
    },
    tearDown: function (cb) {
        var self = this;
        if (!this.$) {
            cb(null);
        } else {
	    console.log('********');
            this.$.top.__ca_graceful_shutdown__(null, cb);
        }
    },
    sms: function (test) {
        test.expect(9);
        var s1;
        var from1 = FROM_1;
        var id;
        test.ok(config.api_key, "Set env variable API_KEY with nexmo key");
        test.ok(config.api_secret, "Set env variable API_SECRET with nexmo" +
                " secret");
        test.ok(config.from, "Set env variable FROM with nexmo" +
                " sender phone#");
        test.ok(to, "Set env variable TO with receiver phone#");

        async.series([
            function(cb) {
                s1 = new cli.Session('ws://foo-xx.localtest.me:3000', from1, {
                    from : from1
                });
                s1.onopen = function() {
                    s1.setConfig(config,  cb);
                };
            },
            function(cb) {
                var cb1 = function(err, reply) {
                    test.ifError(err);
                    id = reply;
                    cb(null);
                };
                s1.send(to, 'Hello my friend', cb1);
            },
            function(cb) {
                // give time for reply
                setTimeout(function() {cb(null);}, 2000);
            },
            function(cb) {
                var cb1 = function(err, reply) {
                    test.ifError(err);
                    console.log(JSON.stringify(reply));
                    test.ok(reply);
                    cb(null);
                };
                s1.getReply(id, cb1);
            },
            function(cb) {
                s1.onclose = function(err) {
                    test.ifError(err);
                    cb(null, null);
                };
                s1.close();
            }
        ], function(err, res) {
            test.ifError(err);
            test.done();
        });
    }
};
