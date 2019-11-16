'use strict';

module.exports = options => {
  const { ports, hostname, logFile } = options;
  const udp = require('dgram');
  const fs = require('fs');

  const requesterAsync = port => {
    const socket = udp.createSocket('udp4');

    const TIME = 60000000001n;
    const start = process.hrtime.bigint();
    const file = `${logFile}_${port}.log`;
    const logMinTime = 50000000000n;
    const logMaxTime = 50000999999n;

    let diff = 0n;
    let cache = '';

    socket.send('Run!', port, hostname);
    setInterval(() => socket.send('Run!', port, hostname), 26000);

    socket.on('message', (msg, info) => {
      const end = process.hrtime.bigint();

      if (diff < TIME) {
        socket.send('Run!', info.port, info.address);

        // logging after 50s
        if (diff < logMaxTime && diff > logMinTime) {
          cache += msg;
          // logger(file, msg);
        }
      } else {
        cache += msg + '>----separator----<';
        logger(file, cache);
        console.log('stop');
      }

      diff = end - start;
    });
    socket.on('close', e => {
      console.log(e);
      setTimeout(() => {
        socket.send('Run!', port, hostname);
      }, 6000);
    });
    socket.on('error', e => {
      console.log(e.message);
      setTimeout(() => {
        socket.send('Run!', port, hostname);
      }, 6000);
    });
  };

  async function logger(file, data) {
    return new Promise((res, rej) => {
      const ws = fs.createWriteStream(file, { flags: 'a' }, 'utf-8');
      ws.write(data);
      ws.on('finish', () => res('Wrote log to file!'));
      ws.on('error', e => rej(e));
      ws.end();
    });
  }

  ports.forEach(port => requesterAsync(port));
};
