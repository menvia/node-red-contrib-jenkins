module.exports = function(RED) {
    "use strict";

    function JenkinsNode(n) {
      RED.nodes.createNode(this,n);
      this.name = n.name;
    }
    
    RED.nodes.registerType("jenkins-credentials",JenkinsNode,{
      credentials: {
        username:  { type: "text" },
        password: { type: "password" }
      }
    });
}