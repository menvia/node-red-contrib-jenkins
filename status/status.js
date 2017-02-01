module.exports = function(RED) {
    function getStatus(config) {
        RED.nodes.createNode(this,config);
        this.url = config.url;
        var node = this;
        this.on('input', function(msg) {
            var jenkins = require('jenkins')({ baseUrl: node.url, crumbIssuer: true });
            jenkins.info(function(err, data) {
                if (err) throw err;
                msg.payload = data;
                node.send(msg);
            });
        });
    }
    RED.nodes.registerType("jenkins-status", getStatus);
}