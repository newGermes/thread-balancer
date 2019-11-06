'use strict';

module.exports = options => {
  const { ports, hostname, logFile } = options;
  const net = require('net');
  const fs = require('fs');

  const requesterAsync = port => {
    const socket = new net.Socket();

    const TIME = 63000000001n;
    const start = process.hrtime.bigint();
    const file = `${logFile}_${port}.log`;
    const logMinTime = 50000000000n;
    const logMaxTime = 50000999999n;

    let diff = 0n;
    let cache = '';

    socket.connect({ port, host: hostname }, () => {
      socket.write('Run!');
    });

    socket.on('data', data => {
      const end = process.hrtime.bigint();

      if (diff < TIME) {
        socket.write('Run!');

        // logging after 50s
        if (diff < logMaxTime && diff > logMinTime) {
          // logger(file, data);
          cache += data;
        }
      } else {
        // logging after 60s
        cache += data + '>----separator----<';
        logger(file, cache);
        console.log('stop');
      }

      diff = end - start;
    });

    socket.on('error', e => {
      console.log(e.message);
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
