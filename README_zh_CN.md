# 插件系统后端模块

> 目前为测试阶段，欢迎其他开发者同学使用并提供反馈

## 简介

这是一个没有具体笔记相关业务功能的插件，而是一个用于为其他插件提供注册运行后端代码的辅助性插件。当其他插件需要使用后端模块时，会声明他们需要这个插件。

如果你是一个思源插件的开发者，并且希望实现一些当前插件系统无法实现的问题时，可以考虑依赖这个插件：
+ 由于插件都运行在前端（浏览器环境或electron环境下的当前BrowserWindow里），页面刷新将导致你的任务挂掉
+ 想实现一些独立运算程序，但是插件运行在与思源界面相同的渲染线程中，会导致笔记软件卡顿
+ 想要基于服务端技术开发一些扩展能力，甚至是服务于Docker化的思源，提供常驻后端能力

如果你有以上类似的想法，想要有一种便捷且规范的方式注入你的后端代码，那么你可以尝试使用以下此模块插件

## 安装

在插件系统中安装此插件，并启用即可。

在安装其他依赖此插件的插件后，目前只能支持刷新的方式来更新后端模块捕获的插件列表。

## 使用

当前已实现桌面端后端模块调用管理能力。Docker版本未来版本中实现。

你只需要在你自己的插件中编写一个`process.js`，并在其中编写你的后端程序代码即可。

下面是一个启动独立http服务的后端模块的例子：
```javascript
const { bridge, logger } = require('siyuan-backend-plugin');

// 监听connect事件，即插件系统与后端模块首次连接或恢复连接
bridge.on('connect', () => {
  logger.info('connected');
  bridge.send('hello, I am connected');
});
// 监听message事件，即收到从插件发送过来的消息
bridge.on('message', (data) => {
  logger.info('message', data);
  if (data === 'hello') {
    // 向后端模块所属插件发送消息
    bridge.send('hello, too');
  }
});
// 监听disconnect事件，即后端模块与插件系统失去了连接
bridge.on('disconnect', () => {
  logger.info('disconnect')
});

const http = require('http')

const port = 3001

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain;charset=utf-8')
  res.end('你好世界\nPID:' + process.pid + " PPID: " + process.ppid)
})

// 使用nodejs的http模块创建http服务器
server.listen(port, () => {
  logger.info(`服务器运行在 http://:${port}/`)
})
```
对应前端插件的写法
```typescript
import { Plugin } from 'siyuan';
import { wait } from 'wait-finish'; // 此模块用于解决插件启动顺序不可控问题

export default class DemoPlugin extends Plugin {
    onload() {
      let handler;
      // 等待后端插件模块完成handler创建并提供给当前插件
      wait('backend-handler_'+this.name, (h) => {
          handler = h;
          handler.send( "hello world"); // 发送消息给本插件的后端模块
          handler.listen((data) => data ) // 接收数据返回
          // **注意**：数据交换是跨进程之间的通信，所以你必须手动进行数据的序列化和反序列化
          // 例如： JSON.stringfy和JSON.parse
          // 目前仅支持使用字符串形式传递接收数据，不支持unit8Array等序列化形式
      }); 
      // 也可以通过事件总线监听数据返回
      this.eventBus.on('backend-plugin', (data) => data); // 数据接收
      this.eventBus.on('backend-plugin-log', (data) => data); // 日志接收
    }
}
```

## 路线图

+ [ ] 强化桌面端版本进程控制
+ [ ] 增加日志查询器
+ [ ] Docker端实现方案