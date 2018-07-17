URI = require('urijs');

module.exports = function(RED) {
    'use strict';

    function JenkinsServer(n) {
      RED.nodes.createNode(this, n);
      this.name = n.name;
      this.url = n.url;

      let jenkins = require('jenkins');

      let uri = new URI(this.url)
        .username(this.credentials.username)
        .password(this.credentials.password);

      let jenkinsConfig = {
          baseUrl: uri.toString(),
          crumbIssuer: true,
      };

      this.api = jenkins(jenkinsConfig);
    }

    RED.nodes.registerType('jenkins-server', JenkinsServer, {
      credentials: {
        username: {type: 'text'},
        password: {type: 'password'},
      },
    });
};
