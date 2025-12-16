const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    // Icon path - PNG works on all platforms
    const iconPath = path.join(__dirname, '../build/icon.png');

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        autoHideMenuBar: true,
        backgroundColor: '#0f0f1a',
        icon: iconPath,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        show: false
    });

    // Determine if we're in development or production
    const isDev = !app.isPackaged;

    if (isDev) {
        // Development: load from Vite dev server
        mainWindow.loadURL('http://localhost:5173');
        // Open DevTools in development
        // mainWindow.webContents.openDevTools();
    } else {
        // Production: load from built files
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Show window when ready to avoid white flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
