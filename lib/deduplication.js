const { v4: uuidv4 } = require("uuid");

/**
 * Deduplicate JSON data.
 * @param {Object|Array} obj - The JSON object or array to deduplicate.
 * @param {Object} [options] - Options for deduplication.
 * @param {boolean} [options.alwaysReplaceWithId] - Whether to always replace objects with an ID present.
 * @returns {Object} The deduplicated JSON structure.
 */
const deduplicate = (obj, options = {}) => {
  const { alwaysReplaceWithId = false } = options;
  const database = {};
  const counts = {};
  const idsMap = new Map();

  const getObjectKey = (object) => {
    return JSON.stringify(object, Object.keys(object).sort());
  };

  const countObjects = (obj) => {
    if (Array.isArray(obj)) {
      obj.forEach((item) => countObjects(item));
    } else if (obj && typeof obj === "object") {
      Object.values(obj).forEach((value) => countObjects(value));
      const key = getObjectKey(obj);
      counts[key] = (counts[key] || 0) + 1;
    }
  };

  const generateId = (obj, path) => {
    const prefix = path.replace(/\.\d+/g, "").replace(/\./g, "_").toUpperCase();
    return `${prefix}_${uuidv4()}`;
  };

  const processObject = (obj, path = "root") => {
    if (Array.isArray(obj)) {
      return obj.map((item, index) => processObject(item, `${path}.${index}`));
    } else if (obj && typeof obj === "object") {
      Object.entries(obj).forEach(([key, value]) => {
        obj[key] = processObject(value, `${path}.${key}`);
      });

      const key = getObjectKey(obj);

      if (counts[key] > 1 || (alwaysReplaceWithId && obj.id)) {
        if (!database[key]) {
          const newId = obj.id || generateId(obj, path);
          database[key] = { id: newId, ...obj };
        }
        if (!idsMap.has(key)) {
          idsMap.set(key, database[key].id);
        }
        return idsMap.get(key);
      } else {
        return obj;
      }
    }
    return obj;
  };

  countObjects(obj);
  const deduplicatedData = processObject(obj);

  return {
    database: Object.fromEntries(
      Object.values(database).map((entry) => [entry.id, entry])
    ),
    data: deduplicatedData,
  };
};

module.exports = deduplicate;
