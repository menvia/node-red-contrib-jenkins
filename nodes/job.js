module.exports = function(RED) {
    'use strict';

    /**
     * Run a job in a Jenkins instance
     * @param {string} config - The Node-RED node configuration
     */
    function job(config) {
        RED.nodes.createNode(this, config);

        this.server = config.server;
        this.job = config.job;
        this.jobType = config.jobType;
        this.parameters = config.parameters;
        this.action = config.action;

        let node = this;
        this.on('input', function(msg) {
            let jenkins_server = RED.nodes.getNode(node.server);

            if (msg.jenkins == undefined) msg.jenkins = {};

            if (node.action == 'build') {
                let job = RED.util.evaluateNodeProperty(node.job, node.jobType, node, msg);
                let parameters = formatParameters(node.parameters);
                jenkins_server.api.job.build({name: job, parameters: parameters}, function(err, data) {
                    if(!processError(node, err)) return;
                    if (msg.jenkins.job == undefined) msg.jenkins.job = {};
                    if (msg.jenkins.build == undefined) msg.jenkins.build = {};

                    msg.jenkins.build.number = data;
                    msg.jenkins.job.name = job;
                    node.send(msg);
                });
            } else if (node.action == 'get') {
                let job = RED.util.evaluateNodeProperty(node.job, node.jobType, node, msg);
                jenkins_server.api.job.get({name: job}, function(err, data) {
                    if(!processError(node, err)) return;

                    msg.jenkins.job = data;
                    node.send(msg);
                });
            } else if (node.action == 'list') {
                jenkins_server.api.job.list(function(err, data) {
                    if(!processError(node, err)) return;

                    msg.jenkins.jobs = data;
                    node.send(msg);
                });
            }
        });
    }
    RED.nodes.registerType('jenkins-job', job);

    function formatParameters(parameters) {
        let res = {};
        for (var i = 0; i < parameters.length; i++) {
            let parameter = parameters[i];
            res[parameter.label] = parameter.value;
        }
        return res;
    }

    function processError(node, err) {
        if (err) {
            node.status({
                fill: 'red',
                shape: 'dot',
                text: 'Error running job',
            });
            node.error('Error starting job: ' + err, err);
            return false;
        } else {
            // Clear the error status
            node.status({});
        }

        return true;
    }
};
