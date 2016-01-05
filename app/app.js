'use strict';

require('./js/controllers');
require('./js/services');

var gui = nequire('nw.gui');
var win = gui.Window.get();

var menuBar = new gui.Menu({
  type: 'menubar'
});

menuBar.createMacBuiltin(gui.App.manifest.name);
win.menu = menuBar;

win.on('blur', function() {
  win.window.document.activeElement.blur();
  win.hide();
});

var tray = new gui.Tray({
  icon: 'img/tray@2x.png'
});

tray.on('click', function(position) {
  win.moveTo(position.x, position.y);
  win.show();
  win.focus();
});

var app = angular.module('app', [
  'app.controllers',
  'app.services',
  'ngAnimate',
  'ui.router',
  'mousetrap'
]);

app.constant('AppConfig', {
  timeout: 16000
});

app.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('login', {
        url: '/',
        templateUrl: './tpl/login.html',
        controller: 'LoginCtrl',
        onEnter: function($state, UserSrv) {
          if (UserSrv.authenticated()) {
            $state.go('home');
          }
        }
      })
      .state('home', {
        url: '/home',
        templateUrl: './tpl/home.html',
        controller: 'HomeCtrl'
      });

    $urlRouterProvider.otherwise('/');
  }
]);

app.run(['$rootScope', function($rootScope) {
  $rootScope.loading = null;
}]);

