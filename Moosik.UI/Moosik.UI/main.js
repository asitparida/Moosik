const electron = require('electron');
const remote = electron.remote;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
var dialog = electron.dialog;
var fs = require('fs');
var path = require('path');

let mainWindow;

function createMainWindow(color, skipShades) {
    activeColor = color || '#262626';
    skipShades = skipShades || false;
    let waSize = electron.screen.getPrimaryDisplay().workAreaSize;
    let appWidth = waSize.width - 60;
    let appHeight = waSize.height - 60;
    let multipler = 1;

    if (appWidth >= 1920)
        multipler = 0.50;
    else if (appWidth >= 1600)
        multipler = 0.70;
    else if (appWidth >= 1366)
        multipler = 0.85;
    else if (appWidth >= 1200)
        multipler = 1;

    mainWindow = new BrowserWindow({ width: appWidth * multipler, height: appHeight * multipler, icon: 'images/icon@4x.ico', resizable: true, movable: true, minimizable: true, maximizable: true, alwaysOnTop: false, frame: false, title: 'Music', show: false, fullscreen: false });
    mainWindow.loadURL('file://' + __dirname + '/index.html')
    mainWindow.type = waSize.width >= 1600 ? 'large' : 'small';
    mainWindow.winSize = 2;
    mainWindow.webContents.openDevTools()
    mainWindow.on('closed', function () {
        mainWindow = null;
        app.quit();
    });
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    })
}

app.on('ready', createMainWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

electron.ipcMain.on('close-main', (event, arg) => {
    if (mainWindow) {
        mainWindow.close();
    }
});

electron.ipcMain.on('app-unmaximize', (event, arg) => {
    if (mainWindow) {
        mainWindow.unmaximize();
    }
});

electron.ipcMain.on('app-maximize', (event, arg) => {
    if (mainWindow) {
        mainWindow.maximize();
    }
});

electron.ipcMain.on('app-read-new-file', (event, arg) => {
    dialog.showOpenDialog(null, { 'title': 'Choose new mp3 file ', 'filters': [{ name: 'mp3', extensions: ['mp3'] }] }, function (fileName) {
        if (fileName === undefined) {
            console.log("You didn't select the file");
            return;
        }
        var mm = require('musicmetadata');
        var parser = mm(fs.createReadStream(fileName[0]), { duration: true }, function (err, metadata) {
            if (err) throw err;
            metadata.filePath = fileName[0];
            event.sender.send('app-read-new-file-reply', metadata);
        });
    });
});

electron.ipcMain.on('app-load-new-playlist', (event, arg) => {
    dialog.showOpenDialog(null, { 'title': 'Choose new mp3 file(s) ', 'filters': [{ name: 'mp3', extensions: ['mp3'] }], 'properties': ['multiSelections'] }, function (fileName) {
        if (fileName === undefined) {
            console.log("You didn't select the file(s).");
        }
        event.sender.send('app-load-new-playlist-reply', fileName);
    });
});

electron.ipcMain.on('app-load-new-bg', (event, arg) => {
    dialog.showOpenDialog(null, { 'title': 'Choose new background image ', 'filters': [{ name: 'Images', extensions: ['jpg', 'png'] }] }, function (fileName) {
        if (fileName === undefined) {
            console.log("You didn't select the file");
        }
        if (fileName && fileName != '') {
            var _fileParts = fileName[0].split('\\');
            event.sender.send('app-load-new-bg-reply', _fileParts);
        }
    });
});

electron.ipcMain.on('app-change-win-size', (event, arg) => {
    if (arg != mainWindow.winSize) {
        var _bounds = mainWindow.getBounds();
        mainWindow.hide();
        mainWindow.unmaximize();
        let waSize = electron.screen.getPrimaryDisplay().workAreaSize;
        let appWidth = waSize.width - 60;
        let appHeight = waSize.height - 60;
        if (arg == 1) {
            appWidth = 600;
            appHeight = 300;
        }
        else if (arg == 0) {
            appWidth = 150;
            appHeight = 150;
        }
        _bounds.width = appWidth;
        _bounds.height = appHeight;
        let posX = 0.5 * (waSize.width - _bounds.width);
        posX = posX < 0 ? 0 : posX;
        let posY = 0.5 * (waSize.height - _bounds.height);
        posY = posY < 0 ? 0 : posY;
        _bounds.x = posX;
        _bounds.y = posY;
        mainWindow.setBounds(_bounds);
        mainWindow.winSize = arg;
        mainWindow.show();
    }
});

//app-change-win-size

/* COLOR EXTARCTION SNIPPET FROM FLATUI */
//var colors = [];
//$('.color').each(function (c) {
//    console.log(c);
//    var name = $(this).attr('class');
//    var code = $(this).attr('data-clipboard-text');
//    colors.push({ name: name, code: code });
//});
//console.log(JSON.stringify(colors));

//"package": "electron-packager . --platform=win32 --arch=all --prune --asar --out=releases/alpha --icon=images/icon@4x.ico"
