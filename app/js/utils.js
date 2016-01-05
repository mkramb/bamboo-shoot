'use strict';

var stripSlash = function(url) {
  if (url.substr(-1) === '/') {
    return url.substr(0, url.length - 1);
  }

  return url;
};

var makeBasicAuth = function(username, password) {
  return 'Basic ' + btoa(username + ':' + password);
};

module.exports = {
  stripSlash: stripSlash,
  makeBasicAuth: makeBasicAuth
};
