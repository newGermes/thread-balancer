'use strict';

module.exports = options => {
  const dgram = require('dgram');
  const server = dgram.createSocket('udp4');
  const memory = process.memoryUsage();

  const { port, hostname, id } = options;
  let count = 0;

  const debounce = (f, ms) => {
    let timeout = null;
    return (...args) => {
      const later = () => {
        timeout = null;
        f(args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, ms);
      if (!timeout) f(args);
    };
  };

  const dataView = debounce(console.log, 500);

  server.on('message', info => {
    count++;

    // dataView({ port, workerId: id, count, memory });
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

  server.bind(port, hostname, () => {
    console.log(`Server has started: ${hostname}:${port}`);
  });
};
