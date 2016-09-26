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
"use strict";

exports.methods = {
    "__ca_init__" : function(cb) {
        this.$.log.debug("++++++++++++++++Calling init");
        this.$.sms.setHandleReplyMethod('handleReply');
        this.state.replies = {};
        cb(null);
    },
    "__ca_resume__" : function(cp, cb) {
        this.$.log.debug("++++++++++++++++Calling resume: pulses=" +
                         this.state.pulses);

        cb(null);
    },
    handleReply: function(id, msg, cb) {
        if (this.state.replies[id] === null) {
            this.state.replies[id] = msg;
            cb(null);
        } else {
            var err = new Error('Key not properly initialized');
            err.id = id;
            err.msg = msg;
            err.before = this.state.replies[id];
            cb(null);
        }
    },
    setConfig: function(config, cb) {
        this.$.sms.setConfig(config);
        cb(null);
    },
    getReply: function(id, cb) {
        var reply = this.state.replies[id];
        if (reply) {
            delete this.state.replies[id];
        }
        cb(null, reply);
    },
    send: function(to, body, cb) {
        var id = this.$.sms.send(to, body);
        this.state.replies[id] = null;
        cb(null, id);
    }
};
