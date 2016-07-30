String.prototype.replaceAll = function (find, replaceWith) {
    var regex = new RegExp(find, 'g');
    return this.replace(regex, replaceWith);
}

String.prototype.toPath = function () {
    var str = this.replaceAll(' ', '%20');
    return str;
}

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
    self.playlistIntialized = false;
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

    self.loadPlaylist = function () {
        try {
            if (self.electron != null) {
                self.electron.ipcRenderer.send('app-load-new-playlist');
                self.electron.ipcRenderer.on('app-load-new-playlist-reply', (event, arg) => {
                    var _trackPromises = [];
                    _.each(arg, function (file) {
                        _trackPromises.push(self.getMetaInformation(file));
                    });
                    $q.all(_trackPromises).then(function (data) {
                        if (typeof data !== 'undefined' && data.length > 0) {
                            self.loadFilesToPlaylist(data);
                        }
                    }, function (data) {
                        /* ERROR */
                    });

                });
            }

        } catch (e) {
            console.log(e);
        }
    }

    self.loadFilesToPlaylist = function (data) {
        if (self.playlistIntialized != true) {
            self.playlistIntialized = true;
            self.playlistTracks = [];
            _.each(data, function (track, iter) {
                var _item = { name: track.title, desc: '', durationSeek: 0, duration: '', currentSeek: 0, current: '00:00', path: '', playing: false };
                if (track.artist.length > 0)
                    _item.desc = track.artist[0];
                if (track.duration) {
                    _item.durationSeek = track.duration;
                    _item.duration = track.duration.toMMSS();
                }
                _item.currentSeek = 0;
                _item.current = _item.currentSeek.toMMSS();
                if (track.filePath)
                    _item.path = track.filePath.replaceAll(' ', '%20');
                _item.id = iter;
                _item.active = false;
                self.playlistTracks.push(_item);
            });
            //$timeout(function myfunction() {
            //    _.each(self.playlistTracks, function (track, iter) {
            //        if (iter == 5)
            //            track.active = true;
            //    });
            //}, 100 * (self.playlistTracks.length + 1));
        }
    }

    self.loadTrackToPlayer = function (track) {
        _.each(self.playlistTracks, function (tr) {
            if (tr.active) {
                if (tr.id !== track.id) {
                    self.pauseTrack(tr);
                    tr.active = false;
                }
            }
            else {
                if (tr.id == track.id) {
                    self.loadTrack(track);
                    tr.active = true;
                    tr.playing = false;
                }
                else {
                    tr.active = false;
                    tr.playing = false;
                }
            }
        });
    }

    self.musicPlaying = function (track) {
        _.each(self.playlistTracks, function (tr) {
            if (tr.id == track.id) {
                tr.active = true;
                tr.playing = true;
            }
            else {
                tr.active = false;
                tr.playing = false;
            }
        });
    }

    self.musicPaused = function (track) {
        _.each(self.playlistTracks, function (tr) {
            if (tr.id == track.id) {
                tr.playing = false;
            }
        });
    }

    self.getMetaInformation = function (track) {
        var _defer = $q.defer();
        try {
            var mm = require('musicmetadata');
            var fs = require('fs');
            var parser = mm(fs.createReadStream(track), { duration: true }, function (err, metadata) {
                if (err) {
                    _defer.resolve(err);
                }
                metadata.filePath = track;
                _defer.resolve(metadata);
            });

        } catch (e) {
            _defer.resolve({});
        }
        return _defer.promise;
    }

    self.initPlaylist = function () { }

    return self;
}]);