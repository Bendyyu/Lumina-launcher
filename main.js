const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1050,
        height: 680,
        resizable: false,
        title: "Lumina Launcher",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.setMenuBarVisibility(false);
    win.loadFile('index.html');
    win.on('page-title-updated', (e) => e.preventDefault());
}

app.name = "Lumina Launcher";
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });