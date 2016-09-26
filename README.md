# CAF (Cloud Assistant Framework)

Co-design permanent, active, stateful, reliable cloud proxies with your web app or gadget.

See http://www.cafjs.com

## CAF SMS
<!-- [![Build Status](http://ci.cafjs.com/api/badges/cafjs/caf_sms/status.svg)](http://ci.cafjs.com/cafjs/caf_sms) -->

This library provides components to send SMS messages using Nexmo  APIs.

## API

    lib/proxy_sms.js

## Configuration Example

### framework.json

        {
            "module": "caf_sms/plug",
            "name": "sms",
            "description": "Access to a SMS service\n Properties: <url> URL for the Nexmo service",
             "env": {
                        "smsURL": "process.env.SMS_URL||https://rest.nexmo.com/sms/json"
                    }
        }

### ca.json

    {
            "module": "caf_sms#plug_ca",
            "name": "sms",
            "description": "SMS service for this CA.",
            "env" : {
                "maxRetries" : "$._.env.maxRetries",
                "retryDelay" : "$._.env.retryDelay"
            },
            "components" : [
                {
                    "module": "caf_sms#proxy",
                    "name": "proxy",
                    "description": "Proxy to sms services for this CA",
                    "env" : {
                    }
                }
            ]
    }
