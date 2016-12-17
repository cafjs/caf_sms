/*!
Copyright 2013 Hewlett-Packard Development Company, L.P.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';
/**
 * Plug that sends SMS messages.
 *
 * Properties:
 *
 *      {smsURL: string}
 *
 * where `smsURL` is the URL of the SMS service provider, e.g., Nexmo.
 *
 * @module caf_sms/plug_sms
 * @augments external:caf_components/gen_plug
 *
 */
var assert = require('assert');
var request = require('request');
var caf_comp = require('caf_core').caf_components;
var genPlug = caf_comp.gen_plug;

exports.newInstance = function($, spec, cb) {
    try {
        var that = genPlug.constructor($, spec);

        $._.$.log && $._.$.log.debug('New sms plug');

        assert.equal(typeof spec.env.smsURL, 'string',
                     "'spec.env.smsURL' is not a string");
        var urlSMS = spec.env.smsURL;

        that.__ca_send__ = function(to, msg, config, cb0) {
            var bodyObj = {
                api_key: config.api_key,
                api_secret: config.api_secret,
                to: to,
                from: config.from,
                text: msg
            };
            request({
                method: 'POST',
                url: urlSMS,
                json: true,
                body: bodyObj
            }, function (error, response, obj) {
                if (error) {
                    cb0(error);
                } else {
                    cb0(error, obj);
                }
            });
        };

        cb(null, that);
    } catch (err) {
        cb(err);
    }
};
