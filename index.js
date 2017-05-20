const express = require('express');
const bodyParser = require('body-parser');
const createStore = require('ameba-mongodb-store');

const recordTypeCache = {};

function initialize(config, port) {
  const app = express();

  function withStore(proc) {
    const store = createStore(
      config.ip, config.port, config.db, config.user, config.password);

    new Promise(() => {
      proc(store);
    })
    .then(() => store.close())
    .catch(() => store.close());
  }

  function filterRequest(proc) {
    return (req, res) => {
      const recordTypeId = req.body.recordTypeId;
      const recordType = recordTypeCache[recordTypeId];

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/json');

      if (!recordType) {
        res.send({ ok: false, message: `cannot find RecordType: ${recordTypeId}` });
      } else {
        proc(req, res, recordType);
      }
    };
  }

  function initializeSaveAPI() {
    app.post('/save', filterRequest((req, res, recordType) => {
      const value = req.body.value;

      withStore((store) => {
        store
        .save(recordType, value)
        .then(() => res.send({ ok: true }))
        .catch(e => res.send({ ok: false, message: e.message }));
      });
    }));
  }

  function initializeReadAPI() {
    app.post('/read', filterRequest((req, res, recordType) => {
      const condition = req.body.condition;
      const option = req.body.option;

      withStore((store) => {
        store
        .read(recordType, condition, option)
        .then(result => res.send({ ok: true, result }))
        .catch(e => res.send({ ok: false, message: e.message }));
      });
    }));
  }

  function initializeUpdateAPI() {
    app.post('/update', filterRequest((req, res, recordType) => {
      const value = req.body.value;
      const condition = req.body.condition;
      const option = req.body.option;

      withStore((store) => {
        store
        .update(recordType, condition, value, option)
        .then(() => res.send({ ok: true }))
        .catch(e => res.send({ ok: false, message: e.message }));
      });
    }));
  }

  function initializeDeleteAPI() {
    app.post('/delete', filterRequest((req, res, recordType) => {
      const condition = req.body.condition;
      const option = req.body.option;

      withStore((store) => {
        store
        .delete(recordType, condition, option)
        .then(() => res.send({ ok: true }))
        .catch(e => res.send({ ok: false, message: e.message }));
      });
    }));
  }

  function initializeCountAPI() {
    app.post('/count', filterRequest((req, res, recordType) => {
      const condition = req.body.condition;

      withStore((store) => {
        store
        .count(recordType, condition)
        .then(result => res.send({ ok: true, count: result }))
        .catch(e => res.send({ ok: false, message: e.message }));
      });
    }));
  }

  app.use(bodyParser.urlencoded({
    extended: true,
  }));
  app.use(bodyParser.json());

  initializeSaveAPI();
  initializeReadAPI();
  initializeUpdateAPI();
  initializeDeleteAPI();
  initializeCountAPI();

  app.listen(port);
}

const service = storeConfig =>
  ({
    register: (recordType) => {
      recordTypeCache[recordType.id] = recordType;
    },
    start: (port) => {
      initialize(storeConfig, port);
    },
  });

module.exports = service;
