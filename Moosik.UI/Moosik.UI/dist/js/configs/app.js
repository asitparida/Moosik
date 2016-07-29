angular.module('MusicUI', ['ngAnimate', 'ui.bootstrap', 'ui.router', 'ngMaterial', 'hmTouchEvents', 'anim-in-out', 'ngResource', 'ngSanitize'])
.config(['$stateProvider', '$locationProvider', registerRoutes])
.run(['$state', '$timeout', init]);

function init($state, $timeout) {
    $state.go('FullScreenMedia');
}

function getViewPath(tag) {
    return 'dist/js/views/' + tag + '.html';
}

function registerRoutes($stateProvider, $locationProvider) {
    $stateProvider
        .state('FullScreenMedia', {
            url: "/FullScreenMedia",
            templateUrl: getViewPath('full-screen-media')
        });
}