module.exports = function(RED) {
    'use strict';

    /**
     * Build a job
     * @param {string} config - The Node-RED node configuration
     */
    function build(config) {
        RED.nodes.createNode(this, config);

        this.server = config.server;

        this.action = config.action;
        this.mode = config.mode;
        this.job = config.job;
        this.jobType = config.jobType;
        this.buildNumber = config.buildNumber;
        this.buildNumberType = config.buildNumberType;

        let node = this;

        this.on('input', function(msg) {
            let jenkins_server = RED.nodes.getNode(node.server);

            if (msg.jenkins == undefined) msg.jenkins = {};

            let job = findJob(node, msg);
            let buildNumber = findBuildNumber(node, msg);

            if(node.action == 'get') {
                jenkins_server.api.build.get(job, buildNumber, function(err, data) {
                    if(!processError(node, err)) return;

                    msg.jenkins.build = data;
                    node.send(msg);
                });
            } else if (node.action == 'log') {
                jenkins_server.api.build.log(job, buildNumber, function(err, data) {
                    if(!processError(node, err)) return;

                    msg.jenkins.build_log = data;
                    node.send(msg);
                });
            } else if (node.action == 'stop') {
                jenkins_server.api.build.stop(job, buildNumber, function(err, data) {
                    if(!processError(node, err)) return;
                    msg.jenkins.build_stop = data;
                    node.send(msg);
                });
            }
        });
    }
    RED.nodes.registerType('jenkins-build', build);

    function processError(node, err) {
        if (err) {
            node.status({
                        fill: 'red',
                        shape: 'dot',
                        text: 'Error getting build info',
                        });
            node.error('Error getting build info for ' + this.job + ' ' + buildNumber, err);
            return false;
        } else {
            // Clear the error status
            node.status({});
        }
        return true;
    }

    function findJob(node, msg) {
        if(node.mode == 'automatic') {
            return msg.jenkins.job.name;
        } else if (node.mode == 'manual') {
            return RED.util.evaluateNodeProperty(node.job, node.jobType, node, msg);
        } else {
            node.error('Unknown mode ' + node.mode);
        }
    }

    function findBuildNumber(node, msg) {
        if(node.mode == 'automatic') {
            return msg.jenkins.build.number;
        } else if (node.mode == 'manual') {
            return RED.util.evaluateNodeProperty(node.buildNumber, node.buildNumberType, node, msg);
        } else {
            node.error('Unknown mode ' + node.mode);
        }
    }
};
