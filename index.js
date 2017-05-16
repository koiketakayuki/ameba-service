const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const recordTypeCache = {};

function initialize() {
  app.use(bodyParser.urlencoded({
    extended: true,
  }));
  app.use(bodyParser.json());
}

function initializeSaveAPI(store) {
  app.post('/save', (req, res) => {
    const value = req.body.value;
    const recordTypeId = req.body.recordTypeId;
    const recordType = recordTypeCache[recordTypeId];

    res.setHeader('Access-Control-Allow-Origin', '*');
    store.save(recordType, value).then(() => res.send({ ok: true }));
  });
}

function initializeReadAPI(store) {
  app.post('/read', (req, res) => {
    const condition = req.body.condition;
    const option = req.body.option;
    const recordTypeId = req.body.recordTypeId;
    const recordType = recordTypeCache[recordTypeId];

    res.setHeader('Access-Control-Allow-Origin', '*');
    store.read(recordType, condition, option).then(result => res.send(result));
  });
}

function initializeUpdateAPI(store) {
  app.post('/update', (req, res) => {
    const value = req.body.value;
    const condition = req.body.condition;
    const option = req.body.option;
    const recordTypeId = req.body.recordTypeId;
    const recordType = recordTypeCache[recordTypeId];

    res.setHeader('Access-Control-Allow-Origin', '*');
    store.update(recordType, condition, value, option).then(() => res.send({ ok: true }));
  });
}

function initializeDeleteAPI(store) {
  app.post('/delete', (req, res) => {
    const condition = req.body.condition;
    const option = req.body.option;
    const recordTypeId = req.body.recordTypeId;
    const recordType = recordTypeCache[recordTypeId];

    res.setHeader('Access-Control-Allow-Origin', '*');
    store.delete(recordType, condition, option).then(() => res.send({ ok: true }));
  });
}

const service = store =>
  ({
    register: (recordType) => {
      recordTypeCache[recordType.id] = recordType;
    },
    start: () => {
      initialize();
      initializeSaveAPI(store);
      initializeReadAPI(store);
      initializeUpdateAPI(store);
      initializeDeleteAPI(store);
    },
  });


module.exports = service;
