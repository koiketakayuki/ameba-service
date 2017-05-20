const cache = {};
const defaultAPISetting = {
  save: true,
  read: true,
  update: true,
  delete: true,
  count: true,
};

function register(recordType, APISetting) {
  const setting = APISetting || defaultAPISetting;

  cache[recordType.id] = {
    recordType,
    setting,
  };
}

function get(recordTypeId, operation) {
  const recordTypeAndSetting = cache[recordTypeId];

  if (!recordTypeAndSetting) {
    return null;
  }

  const recordType = recordTypeAndSetting.recordType;
  const setting = recordTypeAndSetting.setting;

  return setting[operation] ? recordType : null;
}

const recordTypeCache = {
  register,
  get,
};

module.exports = recordTypeCache;
