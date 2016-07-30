Number.prototype.toMMSS = function () {
    var sec_num = this; // don't forget the second param
    var minutes = Math.floor(sec_num / 60);
    minutes = Math.ceil(minutes);
    var seconds = sec_num - (minutes * 60);
    seconds = Math.ceil(seconds);
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return minutes + ':' + seconds;
}

angular.module('MusicUI')
.controller('AppController', ["$scope", "$timeout", "$q", "$state", "SharedService", "$window", function ($scope, $timeout, $q, $state, SharedService, $window) {
    var self = this;
    self.state = $state;
    self.window = $window;
    self.shared = SharedService;
    self.showCurrentColor = false;
    self.direction = 'fwd';
    self.trackMetaData = {
        name: 'XXXX XXXXXX XXXXXX',
        desc: 'XXXX XXXXXX XXXXXX',
        durationSeek: 0,
        duration: 'XX:XX',
        currentSeek: 0,
        current: '00:00',
        path: ''
    };
    self.musicAvailable = false;
    self.musicMuted = false;
    self.hideLoader = false;
    self.musicPlayed = false;
    self.maximized = false;
    self.playlistShown = false;
    self.images = [
            { id: _.uniqueId('img'), src: 'rock-of-ages-broadway-poster.jpg', },
            { id: _.uniqueId('img'), src: '43f3df6ed544836b451f6f609a1faa64.jpg', },
            { id: _.uniqueId('img'), src: '5f001de01e4d55b30de79a2ec97bbda7.jpg', },
            { id: _.uniqueId('img'), src: '98e9816ecf939df3a6d098660c351c35.jpg', },
            { id: _.uniqueId('img'), src: 'andrew-golub-interview-poster-2-376x555px.jpg', },
            { id: _.uniqueId('img'), src: 'b40c45bb516115cae4386d1d556f9729.jpg', },
            { id: _.uniqueId('img'), src: 'bluegal_flyer.jpg', },
            { id: _.uniqueId('img'), src: 'BG169-PO.jpg' },
            { id: _.uniqueId('img'), src: 'rock-of-ages-broadway-poster.jpg', },
            { id: _.uniqueId('img'), src: '43f3df6ed544836b451f6f609a1faa64.jpg', },
            { id: _.uniqueId('img'), src: '5f001de01e4d55b30de79a2ec97bbda7.jpg', },
            { id: _.uniqueId('img'), src: '98e9816ecf939df3a6d098660c351c35.jpg', },
            { id: _.uniqueId('img'), src: 'andrew-golub-interview-poster-2-376x555px.jpg', },
            { id: _.uniqueId('img'), src: 'b40c45bb516115cae4386d1d556f9729.jpg', },
            { id: _.uniqueId('img'), src: 'bluegal_flyer.jpg', },
            { id: _.uniqueId('img'), src: 'BG169-PO.jpg' },
            { id: _.uniqueId('img'), src: 'rock-of-ages-broadway-poster.jpg', },
            { id: _.uniqueId('img'), src: '43f3df6ed544836b451f6f609a1faa64.jpg', },
            { id: _.uniqueId('img'), src: '5f001de01e4d55b30de79a2ec97bbda7.jpg', },
            { id: _.uniqueId('img'), src: '98e9816ecf939df3a6d098660c351c35.jpg', },
            { id: _.uniqueId('img'), src: 'andrew-golub-interview-poster-2-376x555px.jpg', },
            { id: _.uniqueId('img'), src: 'b40c45bb516115cae4386d1d556f9729.jpg', },
            { id: _.uniqueId('img'), src: 'bluegal_flyer.jpg', },
            { id: _.uniqueId('img'), src: 'BG169-PO.jpg' }
    ];

    $timeout(function () {
        self.hideLoader = true;
        $timeout(function () {
            self.processSvg();
        }, 500)
    }, 1000);

    self.closeApp = function () {
        try {
            let electron = require('electron');
            electron.ipcRenderer.send('close-main');
        } catch (e) {
        }
    }

    self.togglePlaylist = function () {
        if (self.playlistShown == false) {
            document.getElementById('fsm_play_unit_holder').classList.add('playListActivated');
            self.playlistShown = true;
            self.shared.initPlaylist();
        }
        else {
            self.playlistShown = false;
            $timeout(function myfunction() {
                document.getElementById('fsm_play_unit_holder').classList.remove('playListActivated');
            }, 300);
        }
    }

    self.musicPlayPause = function () {
        if (self.musicPlayed == true) {
            self.musicPlayed = false;
            self.audioElement.pause();
            self.audioCtx.suspend();
        }
        else if (self.musicPlayed == false) {
            self.musicPlayed = true;
            self.audioElement.play();
            if (!self.renderCharted) {
                renderChart();
                updateTime();
            }
            self.audioCtx.resume();
        }
    }

    self.musicMuteUnmute = function () {
        if (self.musicMuted == true) {
            self.musicMuted = false;
            self.gainNode.gain.value = 1;
        }
        else if (self.musicMuted == false) {
            self.musicMuted = true;
            self.gainNode.gain.value = -1;
        }
    }

    self.maximizeMinimize = function () {
        try {
            let electron = require('electron');
            if (self.shared.maximized) {
                electron.ipcRenderer.send('app-unmaximize');
                self.shared.maximized = false;
            }
            else if (self.shared.maximized == false) {
                electron.ipcRenderer.send('app-maximize');
                self.shared.maximized = true;
            }
        } catch (e) {
        }
    }

    self.getNewFile = function () {
        self.musicPlayed = false;
        self.processConnectAnlayser();
        if (!self.shared.intialized)
            self.shared.intialized = true;
    }

    self.searchAndLoadFile = function () {
        self.shared.openNewAudioFile()
            .then(function (data) {
                if (data != {}) {
                    self.trackMetaData.name = data.title;
                    if (data.artist.length > 0)
                        self.trackMetaData.desc = data.artist[0];
                    if (data.duration) {
                        self.trackMetaData.durationSeek = data.duration;
                        self.trackMetaData.duration = data.duration.toMMSS();
                    }
                    self.trackMetaData.currentSeek = 0;
                    self.trackMetaData.current = self.trackMetaData.currentSeek.toMMSS();
                    if (data.filePath)
                        self.trackMetaData.path = data.filePath.replaceAll(' ', '%20');
                    self.musicPlayed = false;
                    self.musicAvailable = true;
                    self.processConnectAnlayser();
                    if (!self.shared.intialized)
                        self.shared.intialized = true;
                }
            });
    }

    self.trackedSeeked = function () {
        self.audioBufferSource.stop();
        self.audioBufferSource.start(self.audioCtx.currentTime + 10);
    }

    self.processConnectAnlayser = function () {
        self.audioCtx = new ($window.AudioContext || $window.webkitAudioContext)();
        self.audioElement = new Audio(self.trackMetaData.path);
        if (self.audioSrc)
            self.audioSrc.disconnect();
        self.audioSrc = self.audioCtx.createMediaElementSource(self.audioElement);
        self.analyser = self.audioCtx.createAnalyser();
        self.gainNode = self.audioCtx.createGain();
        self.audioSrc.connect(self.analyser);
        self.audioSrc.connect(self.audioCtx.destination);
        self.audioSrc.connect(self.gainNode);
        self.gainNode.connect(self.audioCtx.destination);
        self.audioCtx.suspend();
    }

    self.processSvg = function () {
        var containerId = 'fsm_container';
        if (!self.analyserConnected) {
            self.processConnectAnlayser();
            self.analyserConnected = true;
        }
        var _bounds = document.getElementById(containerId).getBoundingClientRect();
        self.svgHeight = window.innerHeight;
        var svgWidth = _bounds.width;
        var barPadding = '1';
        function createSvg(parent, height, width) {
            angular.element(document.getElementById(containerId)).find('svg').remove();
            return d3.select(parent).append('svg').attr('height', height).attr('width', width);
        }
        self.svg = createSvg('#fsm_container', self.svgHeight, svgWidth);
        self.frequencyData = new Uint8Array(svgWidth / 8);
        var barWidth = svgWidth / (self.frequencyData.length * 4) - barPadding;
        barWidth = barWidth < 1 ? 1 : barWidth;
        self.svg.selectAll('rect')
           .data(self.frequencyData)
           .enter()
           .append('rect')
           .attr('x', function (d, i) {
               return i * (svgWidth / self.frequencyData.length);
           })
           .attr('width', 1);
    }

    angular.element($window).bind('resize', function () {
        self.processSvg();
    });

    self.shared.loadTrack = function (track) {
        self.trackMetaData = track;
        self.musicPlayed = false;
        self.musicAvailable = true;
        self.processConnectAnlayser();
        if (!self.shared.intialized)
            self.shared.intialized = true;
    }

    function updateTime() {
        if (self.musicPlayed && self.audioCtx) {
            var _curr = self.audioCtx.currentTime || 0;
            if (_curr < self.trackMetaData.durationSeek) {
                self.trackMetaData.currentSeek = Math.floor(_curr);
                self.trackMetaData.current = self.trackMetaData.currentSeek.toMMSS();
                angular.element(document.getElementById('fsm_music_current')).html(self.trackMetaData.current);
            }
            else if (_curr > self.trackMetaData.durationSeek) {
                self.musicEnded = false;
                self.musicPlayed = false;
                self.trackMetaData.currentSeek = 0;
                self.trackMetaData.current = self.trackMetaData.currentSeek.toMMSS();
                angular.element(document.getElementById('fsm_music_current')).html(self.trackMetaData.current);
                self.processConnectAnlayser();
            }
        }
        $timeout(updateTime, 500);
    }

    function renderChart() {
        self.renderCharted = true;
        requestAnimationFrame(renderChart);
        self.analyser.getByteFrequencyData(self.frequencyData);
        self.svg.selectAll('rect')
           .data(self.frequencyData)
           .attr('y', function (d) {
               var multiplier = self.svgHeight < 500 ? 0.33 : 0.66;
               return self.svgHeight - (d * multiplier);
           })
           .attr('height', function (d) {
               return d;
           })
           .attr('fill', function (d) {
               return 'rgb(130, 14, 184)';
           });
    }
}])
