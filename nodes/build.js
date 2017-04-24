URI = require('urijs');
util = require('util');

module.exports = function(RED) {
    "use strict";

    /**
     * Build a job
     * @param {string} config - The Node-RED node configuration
     */
    function build(config) {
        RED.nodes.createNode(this, config);

        this.creds = config.creds
        this.url = config.url;

        this.job = config.job;
        this.jobType = config.jobType;
        this.buildNumber = config.buildNumber;
        this.buildNumberType = config.buildNumberType;

        let node = this;

        this.on('input', function(msg) {
            let jenkins = require('jenkins');
            let jenkinsInstance = null

            {
                let url = new URI(node.url)
                  .username(RED.nodes.getNode(node.creds).credentials.username)
                  .password(RED.nodes.getNode(node.creds).credentials.password);

                let jenkinsConfig = {
                    baseUrl: url.toString(),
                    crumbIssuer: true,
                };

                jenkinsInstance = jenkins(jenkinsConfig);
            }

            function getValue(type, value) {
                if (type === 'msg') {
                    return RED.util.getMessageProperty(msg, value);
                } else if (type === 'flow') {
                    return node.context().flow.get(value);
                } else if (type === 'global') {
                    return node.context().global.get(value);
                }
                return value;
            }

            let job = getValue(node.jobType, node.job)
            let buildNumber = getValue(node.buildNumberType, node.buildNumber)

            this.log("Getting build info " + job + " " + buildNumber)
            jenkinsInstance.build.get(job, buildNumber, function(err, data) {
                if (err) {
                    node.status({ 
                                  fill: "red",
                                  shape: "dot",
                                  text: "Error getting build info" 
                                });
                    node.error("Error getting build info for " + this.job + " " + buildNumber, err);
                    return
                }
                
                if (msg.payload.jenkins == undefined) msg.payload.jenkins = {}
                msg.payload.jenkins.build = data;

                node.send(msg);
            });
        });
    }
    RED.nodes.registerType('jenkins-build', build);
};
