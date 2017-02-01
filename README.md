# node-red-contrib-jenkins
Node-RED Jenkins Node

## Developing

The first version is still in progress so to help develop this node please follow the following steps: 

 - Clone the repo
 - Open the repo and run ```sudo npm link```
 - Now navigate to ```~/.node-red``` folder
 - run ```npm link node-red-contrib-jenkins```
 - Done, now you are good to develop and see changes in your node-red
 - Ahhh and remember to restart node-red so the changes affect the running environment

 The steps to develop this node are following the article described here: http://nodered.org/docs/creating-nodes/

 The Jenkins connections uses this npm package: https://www.npmjs.com/package/jenkins