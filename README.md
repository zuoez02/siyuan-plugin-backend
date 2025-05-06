# Plugin System Backend Module

> Currently in the testing phase, welcome other developers to use and provide feedback

## Introduction

This is a plugin without specific note-related business functions, but an auxiliary plugin for other plugins to register and run backend code. When other plugins need to use the backend module, they will declare their need for this plugin.

If you are a developer of Siyuan plugins and want to implement some issues that the current plugin system cannot achieve, you can consider relying on this plugin:
+ Since plugins all run in the front end (browser environment or the current BrowserWindow in the Electron environment), page refresh will cause your tasks to hang
+ Want to implement some independent computing programs, but the plugin runs in the same rendering thread as the Siyuan interface, which will cause the note software to be stuck
+ Want to develop some extended capabilities based on server-side technology, even serving Dockerized Siyuan, providing a resident backend capability

If you have similar ideas above and want a convenient and standardized way to inject your backend code, you can try to use the following this module plugin.

## Installation

Install this plugin in the plugin system and enable it.

After installing other plugins that depend on this plugin, the backend module can only be updated by refreshing to capture the plugin list at present.

## Usage

The current desktop backend module call management capability has been implemented. The Docker version will be implemented in the future version.

You only need to write a `process.js` in your own plugin and write your backend program code in it.

Here is an example of a backend module that starts an independent HTTP service:
```javascript
const { bridge, logger } = require('siyuan-backend-plugin');

// Listen to the 'connect' event, which means the plugin system is connected or reconnected with the backend module for the first time
bridge.on('connect', () => {
  logger.info('connected');
  bridge.send('hello, I am connected');
});
// Listen to the 'message' event, which means a message is received from the plugin
bridge.on('message', (data) => {
  logger.info('message', data);
  if (data === 'hello') {
    // Send a message to the plugin that owns the backend module
    bridge.send('hello, too');
  }
});
// Listen to the 'disconnect' event, which means the backend module has lost the connection with the plugin system
bridge.on('disconnect', () => {
  logger.info('disconnect')
});

const http = require('http')

const port = 3001

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain;charset=utf-8')
  res.end('Hello World\nPID:' + process.pid + " PPID: " + process.ppid)
})

// Use the Node.js http module to create an HTTP server
server.listen(port, () => {
  logger.info(`Server running at http://:${port}/`)
})
```
Corresponding front-end plugin writing
```typescript
import { Plugin } from 'siyuan';
import { wait } from 'wait-finish'; // This module is used to solve the problem of uncontrollable plugin startup order

export default class DemoPlugin extends Plugin {
    onload() {
      let handler;
      // Wait for the backend plugin module to complete the creation of the handler and provide it to the current plugin
      wait('backend-handler_'+this.name, (h) => {
          handler = h;
          handler.send("hello world"); // Send a message to the backend module of this plugin
          handler.listen((data) => data ) // Receive data back
          // **Note**: Data exchange is inter-process communication, so you must manually serialize and deserialize the data
          // For example: JSON.stringify and JSON.parse
          // Currently, only supports passing and receiving data in string form, does not support serialization forms such as Uint8Array
      }); 
      // You can also listen to data back through the event bus
      this.eventBus.on('backend-plugin', (data) => data); // Data reception
      this.eventBus.on('backend-plugin-log', (data) => data); // Log reception
    }
}
```

## Roadmap

+ [ ] Strengthen desktop version process control
+ [ ] Add a log query tool
+ [ ] Docker implementation plan
