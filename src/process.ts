const { bridge } = require('siyuan-backend-plugin');

bridge.on('connect', () => {
  console.log('connected');
  bridge.send('hello, I am connected');
});

bridge.on('message', (data) => {
  console.log('message', data);
  if (data === 'fuck you') {
    bridge.send('fuck you, too');
  }
});
bridge.on('disconnect', () => {
  console.log('disconnect')
});

const http = require('http')

const port = 3001

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain;charset=utf-8')
  res.end('你好世界1123\n' + process.pid + " " + process.ppid)
})

server.listen(port, () => {
  console.log(`服务器运行在 http://:${port}/`)
})