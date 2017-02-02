module.exports = function(RED) {
    /**
     * Get status from a Jenkins instance
     * @param {string} config - The Node-RED node configuration
     */
    function getStatus(config) {
        RED.nodes.createNode(this, config);
        this.url = config.url;
        let node = this;
        this.on('input', function(msg) {
            let jenkins = require('jenkins');
            let jenkinsConfig = {
                baseUrl: node.url,
                crumbIssuer: true,
            };
            let jenkinsInstance = jenkins(jenkinsConfig);
            jenkinsInstance.info(function(err, data) {
                if (err) throw err;
                msg.payload = data.jobs[0].color;
                node.send(msg);
            });
        });
    }
    RED.nodes.registerType('jenkins-status', getStatus);
};
