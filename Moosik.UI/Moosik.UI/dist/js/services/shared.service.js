String.prototype.replaceAll = function (find, replaceWith) {
    var regex = new RegExp(find, 'g');
    return this.replace(regex, replaceWith);
}

String.prototype.toPath = function () {
    var str = this.replaceAll(' ', '%20');
    return str;
}

var _moosikImgArray = {};
var _emulate = true;

angular.module('MusicUI')
.service("SharedService", ["$http", "$q", "$uibModal", "$window", "$resource", "$state", "$timeout", function ($http, $q, $uibModal, $window, $resource, $state, $timeout) {
    var self = this;
    self.activeColor = 'rgb(130, 14, 184)';
    self.maximized = false;
    self.uibModal = $uibModal;
    self.state = $state;
    self.http = $http;
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
                _item.token = track.album;
                _item.currentSeek = 0;
                _item.current = _item.currentSeek.toMMSS();
                if (track.filePath)
                    _item.path = track.filePath.replaceAll(' ', '%20');
                _item.id = iter;
                _item.active = false;
                self.playlistTracks.push(_item);
            });
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

    self.getBingSearchImages = function (token) {
        var _defer = $q.defer();
        if (!_moosikImgArray[token]) {
            if (_emulate || token == '' || token == null) {
                var _tempImages = [
                    { id: _.uniqueId('img'), src: 'url(images/rock-of-ages-broadway-poster.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/43f3df6ed544836b451f6f609a1faa64.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/5f001de01e4d55b30de79a2ec97bbda7.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/98e9816ecf939df3a6d098660c351c35.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/andrew-golub-interview-poster-2-376x555px.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/b40c45bb516115cae4386d1d556f9729.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/bluegal_flyer.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/BG169-PO.jpg)' },
                    { id: _.uniqueId('img'), src: 'url(images/rock-of-ages-broadway-poster.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/43f3df6ed544836b451f6f609a1faa64.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/5f001de01e4d55b30de79a2ec97bbda7.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/98e9816ecf939df3a6d098660c351c35.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/andrew-golub-interview-poster-2-376x555px.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/b40c45bb516115cae4386d1d556f9729.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/bluegal_flyer.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/BG169-PO.jpg)' },
                    { id: _.uniqueId('img'), src: 'url(images/rock-of-ages-broadway-poster.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/43f3df6ed544836b451f6f609a1faa64.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/5f001de01e4d55b30de79a2ec97bbda7.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/98e9816ecf939df3a6d098660c351c35.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/andrew-golub-interview-poster-2-376x555px.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/b40c45bb516115cae4386d1d556f9729.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/bluegal_flyer.jpg)', },
                    { id: _.uniqueId('img'), src: 'url(images/BG169-PO.jpg)' }
                ];
                _defer.resolve(_tempImages);
            }
            else {
                var bingUrl = 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=' + token;
                self.http({ method: 'GET', url: bingUrl, headers: { 'Ocp-Apim-Subscription-Key': '17e7f18881e14e12bb448a4b1ba91e7a' } })
                .then(function (success) {
                    var _images = [];
                    if (success.data) {
                        _images = _.map(success.data.value, function (item) { return { id: _.uniqueId('img'), src: 'url(' + item.contentUrl + ')' } });
                    }
                    _moosikImgArray[token] = _images;
                    _defer.resolve(_images);
                }, function (error) {
                    _defer.resolve([]);
                });
            }
        }
        else
            _defer.resolve(_moosikImgArray[token]);
        return _defer.promise;
    }

    self.initPlaylist = function () { }

    return self;
}]);