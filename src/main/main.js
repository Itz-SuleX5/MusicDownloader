const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const electronDl = require('electron-dl');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    win.loadFile('index.html');
}

ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Selecciona la carpeta de descarga'
    });
    
    if (!result.canceled) {
        return result.filePaths[0];
    }
    return null;
});

ipcMain.handle('download-file', async (event, { url, filename, directory }) => {
    const win = BrowserWindow.getFocusedWindow();
    try {
        await electronDl.download(win, url, {
            directory: directory,
            filename: filename,
            overwrite: true,
            onProgress: (progress) => {
                win.webContents.send('download-progress', progress);
            }
        });
        return true;
    } catch (error) {
        console.error('Error en la descarga:', error);
        throw error;
    }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
}); 