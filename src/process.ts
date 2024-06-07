const { bridge, logger } = require('siyuan-backend-plugin');

bridge.on('connect', () => {
  console.log('connected');
  bridge.send('hello, I am connected');
});

bridge.on('message', (data) => {
  console.log('message', data);
  if (data === 'nice to meet you') {
    bridge.send('nice to meet you, too');
  }
});
bridge.on('disconnect', () => {
  console.log('disconnect')
});

const sleep = (t) => new Promise((resolve) => setTimeout(() => resolve(t), t));

(async function() {
  while(true) {
    await sleep(1000);
    try {
      logger.info("hello world"); 
    } finally {
    }
  }
})()