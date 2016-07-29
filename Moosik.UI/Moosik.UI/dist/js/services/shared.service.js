angular.module('MusicUI')
.service("SharedService", ["$http", "$q", "$uibModal", "$window", "$resource", "$state", function ($http, $q, $uibModal, $window, $resource, $state) {
    var self = this;
    self.activeColor = 'rgb(130, 14, 184)';
    self.maximized = false;
    self.uibModal = $uibModal;
    self.state = $state;
    self.actions = [];
    self.resource = $resource;
    self.preLoadedThemeInEdit = false;
    self.preLoadedTheme = null;
    self.intialized = false;
    try {
        self.electron = require('electron');
    } catch (e) {
        self.electron = null;
    }
    var _defer = undefined;
    self.openNewAudioFile = function () {
        if (_defer) _defer.reject();
        _defer = $q.defer();
        try {
            if (self.electron != null) {
                self.electron.ipcRenderer.send('app-read-new-file');
                self.electron.ipcRenderer.on('app-read-new-file-reply', (event, arg) => {
                    _defer.resolve(arg || {});
                });
            }
            else
                _defer.resolve({});

        } catch (e) {
            console.log(e);
            _defer.resolve({});
        }
        return _defer.promise;
    }

    return self;
}]);