'use strict';

module.exports = options => {
  const dgram = require('dgram');
  const server = dgram.createSocket('udp4');
  const memory = process.memoryUsage();

  const { port, hostname, id, parentPort, isDisconnect, delay } = options;
  let count = 0;

  server.on('message', (msg, info) => {
    count++;

    //sending msg
    server.send(
      JSON.stringify({ port, workerId: id, count, memory }),
      info.port,
      info.address
    );
  });

  server.on('error', err => {
    console.log(`server error:\n${err.stack}`);
    server.close();
  });

  // disconnect
  if (JSON.parse(isDisconnect)) {
    setTimeout(() => {
      if (parentPort) {
        parentPort.postMessage({ port });
      } else {
        process.send({ port });
      }
      server.destroy();
      process.exit(1);
    }, delay);
  }

  server.bind(port, hostname, () => {
    console.log(`Server has started: ${hostname}:${port}`);
  });
};
