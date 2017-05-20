const express = require('express');
const bodyParser = require('body-parser');
const createStore = require('ameba-mongodb-store');

const app = express();
const recordTypeCache = {};

function initialize() {
  app.use(bodyParser.urlencoded({
    extended: true,
  }));
  app.use(bodyParser.json());
}

function withStore(config, proc) {
  const store = createStore(
    config.ip, config.port, config.db, config.user, config.password);

  new Promise(() => {
    proc(store);
  })
  .then(() => store.close())
  .catch(() => store.close());
}

function initializeSaveAPI(config) {
  app.post('/save', (req, res) => {
    const value = req.body.value;
    const recordTypeId = req.body.recordTypeId;
    const recordType = recordTypeCache[recordTypeId];

    withStore(config, (store) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      store.save(recordType, value).then(() => res.send({ ok: true }));
    });
  });
}

function initializeReadAPI(config) {
  app.post('/read', (req, res) => {
    const condition = req.body.condition;
    const option = req.body.option;
    const recordTypeId = req.body.recordTypeId;
    const recordType = recordTypeCache[recordTypeId];

    withStore(config, (store) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      store.read(recordType, condition, option).then(result => res.send(result));
    });
  });
}

function initializeUpdateAPI(config) {
  app.post('/update', (req, res) => {
    const value = req.body.value;
    const condition = req.body.condition;
    const option = req.body.option;
    const recordTypeId = req.body.recordTypeId;
    const recordType = recordTypeCache[recordTypeId];

    withStore(config, (store) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      store.update(recordType, condition, value, option).then(() => res.send({ ok: true }));
    });
  });
}

function initializeDeleteAPI(config) {
  app.post('/delete', (req, res) => {
    const condition = req.body.condition;
    const option = req.body.option;
    const recordTypeId = req.body.recordTypeId;
    const recordType = recordTypeCache[recordTypeId];

    withStore(config, (store) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      store.delete(recordType, condition, option).then(() => res.send({ ok: true }));
    });
  });
}

function initializeCountAPI(config) {
  app.post('/count', (req, res) => {
    const condition = req.body.condition;
    const recordTypeId = req.body.recordTypeId;
    const recordType = recordTypeCache[recordTypeId];

    withStore(config, (store) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      store.count(recordType, condition).then(result => res.send(result));
    });
  });
}

const service = storeConfig =>
  ({
    register: (recordType) => {
      recordTypeCache[recordType.id] = recordType;
    },
    start: (port) => {
      initialize();
      initializeSaveAPI(storeConfig);
      initializeReadAPI(storeConfig);
      initializeUpdateAPI(storeConfig);
      initializeDeleteAPI(storeConfig);
      initializeCountAPI(storeConfig);
      app.listen(port);
    },
  });

module.exports = service;
