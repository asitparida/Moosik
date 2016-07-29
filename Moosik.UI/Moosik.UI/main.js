const electron = require('electron');
const remote = electron.remote;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createMainWindow(color, skipShades) {
    activeColor = color || '#0048ba';
    skipShades = skipShades || false;
    let waSize = electron.screen.getPrimaryDisplay().workAreaSize;
    let appWidth = waSize.width - 60;
    let appHeight = waSize.height - 60;
    mainWindow = new BrowserWindow({ width: appWidth * 0.60, height: appHeight * 0.60, icon: 'images/icon@4x.ico', resizable: true, movable: true, minimizable: true, maximizable: true, alwaysOnTop: false, frame: false, title: 'Music', show: false, fullscreen: false });
    mainWindow.loadURL('file://' + __dirname + '/index.html')
    //mainWindow.webContents.openDevTools()
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
    var dialog = electron.dialog;
    var fs = require('fs');
    dialog.showOpenDialog(null, { 'title': 'Choose new mp3 file ', 'filters': [{ name: 'mp3', extensions: ['mp3'] }] }, function (fileName) {
        if (fileName === undefined) {
            console.log("You didn't select the file");
            return;
        }
        console.log();
        var mm = require('musicmetadata');
        var parser = mm(fs.createReadStream(fileName[0]), { duration: true }, function (err, metadata) {
            if (err) throw err;
            metadata.filePath = fileName[0];
            event.sender.send('app-read-new-file-reply', metadata);
        });
    });
});
