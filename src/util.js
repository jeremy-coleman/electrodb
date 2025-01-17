const t = require("./types");
const e = require("./errors");
const v = require("./validations");

function parseJSONPath(path = "") {
  if (typeof path !== "string") {
    throw new Error("Path must be a string");
  }
  path = path.replace(/\[/g, ".");
  path = path.replace(/\]/g, "");
  return path.split(".");
}

function genericizeJSONPath(path = "") {
  return path.replace(/\[\d+\]/g, "[*]");
}

function getInstanceType(instance = {}) {
  let [isModel, errors] = v.testModel(instance);
  if (!instance || Object.keys(instance).length === 0) {
    return "";
  } else if (isModel) {
    return t.ElectroInstanceTypes.model;
  } else if (instance._instance === t.ElectroInstance.entity) {
    return t.ElectroInstanceTypes.entity;
  } else if (instance._instance === t.ElectroInstance.service) {
    return t.ElectroInstanceTypes.service;
  } else if (instance._instance === t.ElectroInstance.electro) {
    return t.ElectroInstanceTypes.electro;
  } else {
    return "";
  }
}

function getModelVersion(model = {}) {
  let nameOnRoot = model && v.isStringHasLength(model.entity);
  let nameInModelNamespace = model && model.model && v.isStringHasLength(model.model.entity);
  if (nameInModelNamespace) {
    return t.ModelVersions.v1
  } else if (nameOnRoot) {
    return t.ModelVersions.beta;
  } else {
    return "";
  }
}

function applyBetaModelOverrides(model = {}, {service = "", version = "", table = ""} = {}) {
  let type = getModelVersion(model);
  if (type !== t.ModelVersions.beta) {
    throw new Error("Invalid model");
  }
  let copy = Object.assign({}, model);
  if (v.isStringHasLength(service)) {
    copy.service = service;
  }
  if (v.isStringHasLength(version)) {
    copy.version = version;
  }
  if (v.isStringHasLength(table)) {
    copy.table = table;
  }
  return copy;
}

function batchItems(arr = [], size) {
  if (isNaN(size)) {
    throw new Error("Batch size must be of type number");
  }
  let batched = [];
  for (let i = 0; i < arr.length; i++) {
    let partition = Math.floor(i / size);
    batched[partition] = batched[partition] || [];
    batched[partition].push(arr[i]);
  }
  return batched;
}

function commaSeparatedString(array = [], prefix = '"', postfix = '"') {
  return array.map(value => `${prefix}${value}${postfix}`).join(", ");
}

function formatStringCasing(str, casing, defaultCase) {
  if (typeof str !== "string") {
    return str;
  }
  let strCase = defaultCase;
  if (v.isStringHasLength(casing) && typeof t.KeyCasing[casing] === "string") {
    strCase = t.KeyCasing.default === casing
        ? defaultCase
        : t.KeyCasing[casing];
  }
  switch (strCase) {
    case t.KeyCasing.upper:
      return str.toUpperCase();
    case t.KeyCasing.none:
      return str;
    case t.KeyCasing.lower:
      return str.toLowerCase();
    case t.KeyCasing.default:
    default:
      return str;
  }
}

function formatKeyCasing(str, casing) {
  return formatStringCasing(str, casing, t.KeyCasing.lower);
}

function formatAttributeCasing(str, casing) {
  return formatStringCasing(str, casing, t.KeyCasing.none);
}

function formatIndexNameForDisplay(index) {
  if (index) {
    return index;
  } else {
    return "(Primary Index)";
  }
}

module.exports = {
  batchItems,
  parseJSONPath,
  getInstanceType,
  getModelVersion,
  formatKeyCasing,
  genericizeJSONPath,
  commaSeparatedString,
  formatAttributeCasing,
  applyBetaModelOverrides,
  formatIndexNameForDisplay
};
