/*! Shim for node-domexception using native platform DOMException */
module.exports = globalThis.DOMException || Error;
