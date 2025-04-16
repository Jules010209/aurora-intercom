import { app, shell, BrowserWindow, ipcMain, Notification } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import Store from 'electron-store';
import { autoUpdater } from 'electron-updater';
import { TCPClient } from './Client';

export const storage = new Store({ watch: true });

if (is.dev) {
  autoUpdater.updateConfigPath = join(__dirname, 'dev-app-update.yml');
}

let mainWindow: BrowserWindow | null = null;
let tcpClient: TCPClient;

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    title: 'Aurora Intercom',
    width: 900,
    height: 670,
    minHeight: 590,
    minWidth: 870,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  tcpClient = new TCPClient(
    (msg) => {
      if (mainWindow) {
        mainWindow.webContents.send('tcp_data', msg);
      }
    },
    (err) => {
      console.error(err);
      new Notification({
        title: 'INTERCOM TCP ERROR',
        body: 'An error occurred during tcp connection'
      }).show();
    },
    () => {
      console.log('Disconnected from TCP Server!');
      new Notification({
        title: 'INTERCOM TCP ERROR',
        body: 'Disconnected from TCP server'
      }).show();
    }
  );

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.ipc.on('send_data', (_, cmd) => {
    tcpClient.send(`#${cmd}`);
  });

  ipcMain.handle('config', async (_, key) => {
    return storage.get(key);
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
};

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.jules010209');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('ready', () => {
  autoUpdater.checkForUpdates();
});

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (_) => {
  console.log('Update available.');
});

autoUpdater.on('update-not-available', (_) => {
  console.log('Update not available.');
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
  console.log(log_message);
});

ipcMain.handle('check-for-updates', async () => {
  try {
    await autoUpdater.checkForUpdates();
    return { success: true };
  } catch (err) {
    return { success: false, error: err?.toString() };
  }
});

autoUpdater.on('update-downloaded', (_) => {
  console.log('Update downloaded');
  new Notification({
    title: 'Mise à jour disponible',
    body: 'Une nouvelle version a été téléchargée. L’application va redémarrer pour appliquer la mise à jour.'
  }).show();
  setTimeout(() => {
    autoUpdater.quitAndInstall();
  }, 4000);
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
