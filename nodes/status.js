URI = require('urijs');
util = require('util');

module.exports = function(RED) {
    'use strict';

    /**
     * Get status from a Jenkins instance
     * @param {string} config - The Node-RED node configuration
     */
    function getStatus(config) {
        RED.nodes.createNode(this, config);

        this.creds = config.creds;
        this.url = config.url;

        let node = this;
        this.on('input', function(msg) {
            let jenkins = require('jenkins');
            let jenkinsInstance = null;

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

            jenkinsInstance.info(function(err, data) {
                if (err) return node.error('Error getting info from Jenkins', err);
                msg.payload = data.jobs[0].color;

                node.send(msg);
            });
        });
    }
    RED.nodes.registerType('jenkins-status', getStatus);
};
