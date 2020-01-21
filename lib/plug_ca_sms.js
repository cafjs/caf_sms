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
const caf_core = require('caf_core');
const caf_comp = caf_core.caf_components;
const json_rpc = caf_core.caf_transport.json_rpc;
const myUtils = caf_comp.myUtils;
const genPlugCA = caf_comp.gen_plug_ca;

exports.newInstance = async function($, spec) {
    try {
        const that = genPlugCA.create($, spec);

        /*
         * The contents of this variable are always checkpointed before
         * any state externalization (see `gen_transactional`).
         */
        that.state = {}; // replyMethod:string, configSMS:caf.smsConfig

        // transactional ops
        const target = {
            async setHandleReplyMethodImpl(methodName) {
                that.state.replyMethod = methodName;
                return [];
            },
            async setConfigImpl(config) {
                that.state.configSMS = config;
                return [];
            },
            async sendImpl(to, body, id) {
                const result = [null];
                try {
                    result[1] = await $._.$.sms.__ca_send__(
                        to, body, that.state.configSMS
                    );
                } catch (err) {
                    result[0] = err;
                }
                if (that.state.replyMethod) {
                    const m = json_rpc.systemRequest($.ca.__ca_getName__(),
                                                     that.state.replyMethod,
                                                     id, result);
                    $.ca.__ca_process__(m, function(err) {
                        err && $.ca.$.log && $.ca.$.log.error(
                            'Got handler error ' + myUtils.errToPrettyStr(err)
                        );
                    });
                } else {
                    const logMsg = 'Ignoring reply ' + JSON.stringify(result);
                    $.ca.$.log && $.ca.$.log.warn(logMsg);
                }
                return [];
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
            if (that.state.configSMS) {
                that.__ca_lazyApply__('sendImpl', [to, body, id]);
            } else {
                const err = new Error('No configuration');
                throw err;
            }
        };

        // Framework methods
        const super__ca_resume__ =
                  myUtils.superiorPromisify(that, '__ca_resume__');
        that.__ca_resume__ = async function(cp) {
            try {
                if (cp) {
                    // backwards compatible...
                    await super__ca_resume__(cp);
                    that.state.replyMethod = that.state.replyMethod ||
                        cp.replyMethod;
                    that.state.configSMS = that.state.configSMS || cp.configSMS;
                }
                return [];
            } catch (err) {
                return [err];
            }
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};
