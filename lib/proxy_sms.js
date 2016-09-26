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
 * Proxy to use a SMS messaging service like nexmo.
 *
 * @name caf_react/proxy_sms
 * @namespace
 * @augments gen_proxy
 *
 */
var caf_core = require('caf_core');
var caf_comp = caf_core.caf_components;
var genProxy = caf_comp.gen_proxy;
var uuid = require('node-uuid').v4;

/**
 * Factory method to use a SMS messaging service like nexmo.
 *
 * @see sup_main
 */
exports.newInstance = function($, spec, cb) {

    var that = genProxy.constructor($, spec);

    /**
     * Sets the name of the method in this CA that will process reply messages.
     *
     * To ignore replies, just set it to 'null'
     *
     * The type of the method should be 'function(messageId, body, cb)'
     *
     * where 'messageId' is an unique identifier to match the request.
     *       'body' is the JSON-parsed response
     *       'cb' is just the usual callback to notify completion.
     *
     * @param {string| null} methodName The name of this CA's method that
     *  process reply messages.
     *
     * @name caf_sms/setHandleReplyMethod
     * @function
     *
     */
    that.setHandleReplyMethod = function(methodName) {
        $._.setHandleReplyMethod(methodName);
    };

    /**
     * Sets the Nexmo configuration properties to use its APIs.
     *
     * The type `caf.smsConfig` is:
     *    {api_key:string, api_secret:string, from:number}
     *
     * @param {caf.smsConfig} config The Nexmo configuration properties.
     *
     * @name caf_sms/setConfig
     * @function
     *
     */
    that.setConfig = function(config) {
        $._.setConfig(config);
    };


    /**
     * Sends a message. The return message id can be used to match
     * requests/responses.
     *
     *
     * @param {number} to Receiver number.
     * @param {string} body A message to send.
     *
     * @name caf_sms/request
     * @function
     *
     */
    that.send = function(to, body) {
        var uuidVal = uuid();
        $._.send(to, body, uuidVal);
        return uuidVal;
    };

    Object.freeze(that);
    cb(null, that);
};
