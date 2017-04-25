module.exports = function(RED) {
    "use strict";

    /**
     * Build a job
     * @param {string} config - The Node-RED node configuration
     */
    function build(config) {
        RED.nodes.createNode(this, config);

        this.server = config.server

        this.job = config.job;
        this.jobType = config.jobType;
        this.buildNumber = config.buildNumber;
        this.buildNumberType = config.buildNumberType;

        let node = this;

        this.on('input', function(msg) {
            let jenkins_server = RED.nodes.getNode(node.server);

            let job = RED.util.evaluateNodeProperty(node.job, node.jobType, node, msg);
            let buildNumber = RED.util.evaluateNodeProperty(node.buildNumber, node.buildNumberType, node, msg)

            jenkins_server.api.build.get(job, buildNumber, function(err, data) {
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
