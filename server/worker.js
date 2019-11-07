'use strict';

const path = require('path');
const configPath = path.join(__dirname, 'config.js');
const { transportName, spawnerName, delay } = require(configPath);

const transportPath = path.join(__dirname, 'transport', `${transportName}.js`);
const spawnerPath = path.join(__dirname, 'spawner', `${spawnerName}.js`);

const transport = require(transportPath);
const { port, hostname, id, isDisconnect, parentPort } = require(spawnerPath);

// run
transport({ port, hostname, id, parentPort, isDisconnect, delay });
