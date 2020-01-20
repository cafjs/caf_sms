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
 * Plug for sending SMS messages by this CA.
 *
 * @module caf_sms/plug_ca_sms
 * @augments external:caf_components/gen_plug_ca
 *
 */
var caf_core = require('caf_core');
var caf_comp = caf_core.caf_components;
var json_rpc = caf_core.caf_transport.json_rpc;
var myUtils = caf_comp.myUtils;
var genPlugCA = caf_comp.gen_plug_ca;

exports.newInstance = function($, spec, cb) {
    try {

        var replyMethod = null;
        var configSMS = null;
        var that = genPlugCA.create($, spec);

        // transactional ops
        var target = {
            setHandleReplyMethodImpl: function(methodName, cb0) {
                replyMethod = methodName;
                cb0(null);
            },
            setConfigImpl: function(config, cb0) {
                configSMS = config;
                cb0(null);
            },
            sendImpl: function(to, body, id, cb0) {
                var replyF = function(result) {
                    if (replyMethod) {
                        var m = json_rpc.systemRequest($.ca.__ca_getName__(),
                                                       replyMethod, id, result);
                        $.ca.__ca_process__(m, function(err) {
                            if (err) {
                                $._.$.log &&
                                    $._.$.log.err('Got handler error ' +
                                                  myUtils.errToPrettyStr(err));
                            }
                        });
                    }
                    cb0(null);
                };
                $._.$.sms.__ca_send__(to, body, configSMS,
                                      function(err, result) {
                                          if (err) {
                                              cb0(err);
                                          } else {
                                              replyF(result);
                                          }
                                      });
            }
        };

        that.__ca_setLogActionsTarget__(target);

        that.setHandleReplyMethod = function(methodName) {
            that.__ca_lazyApply__('setHandleReplyMethodImpl', [methodName]);
        };

        that.setConfig = function(config) {
            that.__ca_lazyApply__('setConfigImpl', [config]);
        };

        that.send = function(to, body, id) {
            if (configSMS) {
                that.__ca_lazyApply__('sendImpl', [to, body, id]);
            } else {
                var err = new Error('No configuration');
                throw err;
            }
        };

        // Framework methods
        var super__ca_resume__ = myUtils.superior(that, '__ca_resume__');
        that.__ca_resume__ = function(cp, cb0) {
            replyMethod = cp.replyMethod || null;
            configSMS = cp.configSMS || null;
            super__ca_resume__(cp, cb0);
        };

        var super__ca_prepare__ = myUtils.superior(that, '__ca_prepare__');
        that.__ca_prepare__ = function(cb0) {
            super__ca_prepare__(function(err, data) {
                if (err) {
                    cb0(err, data);
                } else {
                    data.replyMethod = replyMethod;
                    data.configSMS = configSMS;
                    cb0(err, data);
                }
            });
        };

        cb(null, that);
    } catch (err) {
        cb(err);
    }
};
