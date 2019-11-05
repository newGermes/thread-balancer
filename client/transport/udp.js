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

    socket.send(Buffer.from('Run!'), port, hostname, error => {
      if (error) {
        console.log(error);
        socket.close();
      } else {
        console.log('Data sent !!!');
      }
    });

    socket.on('message', (msg, info) => {
      const end = process.hrtime.bigint();

      if (diff < TIME) {
        socket.send(Buffer.from('Run!'), info.port, info.address, error => {
          if (error) {
            console.log(error);
            socket.close();
          } else {
            console.log('Data sent !!!');
          }
        });

        // logging after 50s
        if (diff < logMaxTime && diff > logMinTime) {
          logger(file, msg);
        }
      } else {
        // logging after 60s
        msg += '>----separator----<';
        logger(file, msg);
      }

      diff = end - start;
    });
  };

  function logger(file, data) {
    const ws = fs.createWriteStream(file, { flags: 'a' }, 'utf-8');
    ws.write(data);
    ws.on('finish', () => {
      console.log('Wrote log to file!');
    });
    ws.end();
  }

  ports.forEach(port => requesterAsync(port));
};
