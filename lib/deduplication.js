const uuid = require("react-native-uuid").default;

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
    // Create a copy of the object without 'id' and 'type' before stringify
    const objCopy = { ...object };
    delete objCopy.id;
    delete objCopy.type;
    return JSON.stringify(objCopy, Object.keys(objCopy).sort());
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

  const generateId = (category) => {
    const prefix = category.toUpperCase();
    return `${prefix}_${uuid.v4()}`;
  };

  const processObject = (obj, category = "root", path = "root") => {
    if (Array.isArray(obj)) {
      return obj.map((item, index) =>
        processObject(item, category, `${path}.${index}`)
      );
    } else if (obj && typeof obj === "object") {
      // If 'type' exists in the object, use it as the category
      const currentCategory = obj.type || category;

      Object.entries(obj).forEach(([key, value]) => {
        obj[key] = processObject(value, key, `${path}.${key}`);
      });

      const key = getObjectKey(obj);

      if (counts[key] > 1 || (alwaysReplaceWithId && obj.id)) {
        if (!database[currentCategory]) {
          database[currentCategory] = {};
        }
        if (!database[currentCategory][key]) {
          // Extract 'id' and 'type' before storing in the database
          const { id, type, ...objectToStore } = obj;
          const newId = id || generateId(currentCategory);
          database[currentCategory][newId] = { ...objectToStore };
          idsMap.set(key, newId); // Store the ID in the map
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
    database,
    data: deduplicatedData,
  };
};

module.exports = deduplicate;
