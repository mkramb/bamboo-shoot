'use strict';

var util = require('./utils');
var notify = nequire('osx-notifier');
var gui = nequire('nw.gui');
var low = nequire('lowdb');

function ActivitySrv(
  $http, $q,
  UserSrv
) {
  var orderBranches = function (branches) {
    var repos = {};
    var data = [];

    branches.forEach(function(branch) {
      if (!repos[branch.repositoryName]) {
        data.push({ name: branch.repositoryName, branches: [] });
        repos[branch.repositoryName] = data.length;
      }

      data[repos[branch.repositoryName]-1]
        .branches.push(branch);
    });

    return data;
  };

  this.fetchAll = function() {
    var deferred = $q.defer();
    var user = UserSrv.authenticated();
    var activityUrl = util.stripSlash(user.hostname)
      + '/rest/recent-activity/latest/mine';

    var request = {
      url: activityUrl,
      timeout: deferred.promise,
      method: 'GET',
      headers: {
        'Authorization': util.makeBasicAuth(
          user.username,
          user.password
        )
      }
    };

    $http(request).success(function(data) {
      if (data) {
        data = orderBranches(data);
        deferred.resolve(data);
      }
    })
    .finally(deferred.reject);

    return deferred;
  };

}

function UserSrv(
  $http, $q,
  AppCache, StateSrv
) {
  var state = StateSrv.get('user');

  this.login = function(data) {
    this.form = angular.copy(data);

    var loginUrl = util.stripSlash(this.form.hostname)
      + '/rest/api/latest/search/users?searchTerm=' + this.form.username
      + '&includeAvatars=true&os_authType=basic';

    var request = {
      url: loginUrl,
      method: 'GET',
      headers: {
        'Authorization': util.makeBasicAuth(
          this.form.username,
          this.form.password
        )
      }
    };

    var deferred = $q.defer();

    $http(request).success(function(data) {
      if (this.validate(this.form, data)) {
        deferred.resolve(data);
      }
    }.bind(this)).finally(
      deferred.reject
    );

    return deferred.promise;
  };

  this.validate = function(login, data) {
    var user = null;

    data.searchResults.forEach(function(result) {
      if (result.searchEntity.username === this.form.username) {
        user = result.searchEntity;
        user.hostname = login.hostname;
        user.password = login.password;
      }
    }.bind(this));

    if (user) {
      state.remove();
      state.push(user)
    }

    return user;
  };

  this.authenticated = function() {
    if (!state.isEmpty()) {
      return this.user();
    }
  };

  this.logout = function() {
    AppCache.remove('user');
    StateSrv.remove();
  };

  this.user = function() {
    var user = AppCache.get('user');

    if (!user) {
      user = state.first();
      AppCache.put('user', user);
      return user;
    }

    return user;
  }
}

function NotificationSrv(
  $timeout,
  UserSrv
) {
  var showNotification = function(summary) {
    var outcome = summary.successful ? 'was successful' : 'failed';
    var type = summary.successful ? 'pass' : 'fail';

    notify({
      type: type,
      group: 'bambooShoot',
      title: summary.planName + ' ' + outcome,
      message: summary.testsSummary,
      open: util.stripSlash(UserSrv.user().hostname)
        + '/browse/' + summary.planKey + '/latest'
    });
  }

  this.notify = function(resultSummaries) {
    var time = -2000;

    resultSummaries.forEach(function(summary) {
      time += 2000;

      $timeout(function() {
        showNotification(summary);
      }, time);
    });
  };
}

function StateSrv() {
  var db = low(gui.App.dataPath + '/state.json', {
    autosave: true,
    async: true
  });

  var namespaces = [];

  this.get = function(namespace) {
    if (namespaces.indexOf(namespace) === -1) {
      namespaces.push(namespace);
    }

    return db(namespace);
  };

  this.remove = function() {
    namespaces.forEach(function(namespace) {
      db(namespace).remove();
    })
  }
}

angular.module('app.services', [])
  .factory('AppCache', function($cacheFactory) {
    return $cacheFactory('user');
  })
  .service('ActivitySrv', [
    '$http', '$q', 'UserSrv',
    ActivitySrv
  ])
  .service('UserSrv', [
    '$http', '$q', 'AppCache', 'StateSrv',
    UserSrv
  ])
  .service('NotificationSrv', [
    '$timeout', 'UserSrv',
    NotificationSrv
  ])
  .service('StateSrv', [
    StateSrv
  ]);
