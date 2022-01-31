const electron = require('electron');
const path = require('path');
const app = electron.app;
const { BrowserWindow } = require("electron-acrylic-window");

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			worldSafeExecuteJavaScript: false,
			enableRemoteModule: true,
			preload: path.join(__dirname, 'preload.js')
		},
		vibrancy: {
			theme: 'appearance-based',
			effect: 'blur',
			useCustomWindowRefreshMethod: true,
			maximumRefreshRate: 60,
			disableOnBlur: false,
		},
	});
	mainWindow.loadURL(`file://${__dirname}/electron-index.html`);
	mainWindow.webContents.openDevTools();
	mainWindow.on('closed', function () {
		mainWindow = null;
	});
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow();
	}
});
