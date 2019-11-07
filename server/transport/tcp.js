'use strict';

module.exports = options => {
  const net = require('net');

  const { port, hostname, id, parentPort, isDisconnect, delay } = options;
  let count = 0;

  const connection = socket => {
    const memory = process.memoryUsage();

    socket.on('data', data => {
      count++;

      socket.write(JSON.stringify({ port, workerId: id, count, memory }));
    });

    socket.on('error', e => {
      console.log(e.message);
    });

    // disconnect
    if (JSON.parse(isDisconnect)) {
      setTimeout(() => {
        if (parentPort) {
          parentPort.postMessage({ port });
        } else {
          process.send({ port });
        }
        socket.destroy();
        process.exit(1);
      }, delay);
    }
  };

  const server = net.createServer(connection);

  server.listen(port, hostname, () => {
    console.log(`Server has started: ${hostname}:${port}`);
  });
};
