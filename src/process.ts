const { ipcRenderer } = require('electron');

let port: any;

const sleep = async () => new Promise((resolve) => {
  setTimeout(resolve, 1000);
})

ipcRenderer.on('connect', async (event, args) => {
  port = event.ports[0];
  console.log('connect', port);
  port.onmessage = (e) => {
    console.log(e.data); 
    port.postMessage("fuck you, three");
  }
  setTimeout(() => {
    port.postMessage("fuck you");
  }, 1000);
})

ipcRenderer.on('disconnect', (event, args) => {
  port.onmessage = undefined;
  port = undefined;
})

const http = require('http')

const p = 3001

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain;charset=utf-8')
  res.end('你好世界1123\n' + process.pid + " " + process.ppid)
})

server.listen(port, () => {
  console.log(`服务器运行在 http://:${p}/`)
})