'use strict';

var cp = nequire('child_process');
var gui = nequire('nw.gui');
var util = require('./utils');

function LoginCtrl(
  $scope, $rootScope, $state, $timeout,
  UserSrv
) {
  $scope.section = 'login';

  $scope.submit = function(form) {
    $rootScope.loading = true;

    UserSrv.login(form)
      .then(function(data) {
        $state.go('home');
      }, function() {
        $timeout(function() {
          $rootScope.loading = false;
        }, 1000);
      });
  };
}

function HomeCtrl(
  $scope, $rootScope, $state, $animate, $timeout,
  UserSrv, ActivitySrv, NotificationSrv, AppConfig
) {
  $scope.section = 'home';
  $scope.branch = null;
  $scope.repos = [];

  $scope.myKeybindings = {
    bindGlobal: {
      'shift+up': function() {
        scroll(false).focus();
      },
      'shift+down': function() {
        scroll(true).focus();
      },
      'shift+left': function() {
        $scope.branch = null;
      }
    }
  };

  var timeout = null;
  var request = null;

  var fetchActivity = function() {
    timeout = $timeout(function() {
      request = ActivitySrv.fetchAll()
      request.promise.then(processData);
    }, AppConfig.timeout);
  };

  var processData = function(data) {
    if (data !== null) {
      var child = cp.fork('app/worker.js');

      child.on('message', function(message) {
        if (message.newResult) {
          NotificationSrv.notify(message.resultSummaries);

          $scope.$apply(function() {
            $scope.repos = message.newResult;
          });
        }

        fetchActivity();
        child.kill();

        message = null;
        child = null;
      });

      child.send({
        latestResult: angular.copy($scope.repos),
        newResult: data
      });
    }
  };

  var scroll = function(direction) {
    var element = angular.element('a:focus');
    var initial = direction ?
      '.item.row:first' : '.item.row:last';

    if (!element.length) {
      element = angular.element(initial).parent();
    }
    else {
      var next = direction ?
        element.next('a') : element.prev('a');

      if (!next.length) {
        next = direction ?
          element.parent().next().find('a:first') :
          element.parent().prev().find('a:last')

        if (!next.length) {
          next = element.parent().parent().find(
            direction ? 'a:first' : 'a:last'
          );
        }
      }

      element = next;
    }

    return element;
  };


  $scope.track = function(branch) {
    return [
      branch.branchId,
      branch.resultSummaries.length
    ].join('#');
  };

  $scope.select = function(branch) {
    $scope.branch = branch;
  };

  $scope.open = function(result) {
    gui.Shell.openExternal(
      util.stripSlash(UserSrv.user().hostname)
        + '/browse/' + result.planKey + '/latest'
    );
  };

  $scope.refresh = function() {
    $timeout.cancel(timeout);
    $rootScope.loading = true;
    timeout = null;

    if (request) {
      request.resolve(null);
      request = null;
    }

    ActivitySrv.fetchAll()
      .promise.then(processData)
        .finally(function() {
          $scope.branch = null;
          $rootScope.loading = false;
        });
  };

  $scope.logout = function() {
    $timeout.cancel(timeout);
    $animate.enabled(false);

    timeout = null;
    request = null;
    document.onkeydown = null;

    UserSrv.logout();
    $state.go('login');
  };

  $scope.refresh();
}

angular.module('app.controllers', [])
  .controller('LoginCtrl', [
    '$scope', '$rootScope', '$state', '$timeout',
    'UserSrv',
    LoginCtrl
  ])
  .controller('HomeCtrl', [
    '$scope', '$rootScope', '$state', '$animate', '$timeout',
    'UserSrv', 'ActivitySrv', 'NotificationSrv', 'AppConfig',
    HomeCtrl
  ]);
