angular.module('MusicUI')
.service("SharedService", ["$http", "$q", "$uibModal", "$window", "$resource", "$state", "$timeout", function ($http, $q, $uibModal, $window, $resource, $state, $timeout) {
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

    self.initPlaylist = function () {
        $timeout(function () {
            if (self.playlistIntialized != true) {
                self.playlistTracks = [];
                _.each(_.range(20), function (iter) {
                    var _item = {
                        name: 'Cheap Thrills',
                        desc: 'Sia Fulrer (2015)',
                        durationSeek: 0,
                        duration: '03:15',
                        currentSeek: 0,
                        current: '00:00',
                        path: 'assets/Cheap Thrills - Sia (320kbps).mp3'
                    };
                    _item.id = iter;
                    _item.active = false;
                    self.playlistTracks.push(_item);
                });
                self.playlistIntialized = true;
                $timeout(function myfunction() {
                    _.each(self.playlistTracks, function (track, iter) {
                        if (iter == 5)
                            track.active = true;
                    });
                }, 100 * (self.playlistTracks.length + 1));
            }
        }, 500);
    }

    return self;
}]);