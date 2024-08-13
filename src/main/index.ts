import { app, shell, BrowserWindow, ipcMain, Notification } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import * as net from 'net';
import Store from 'electron-store';
import { autoUpdater } from 'electron-updater';

export const TCPClient = new net.Socket();
export const storage = new Store({ watch: true });

if(is.dev) {
  // Useful for some dev/debugging tasks, but download can
  // not be validated becuase dev app is not signed
  autoUpdater.updateConfigPath = join(__dirname, 'dev-app-update.yml');
}

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.ipc.on('send_data', (_, cmd) => {
    TCPClient.write(`#${cmd}\n`);
  });

  ipcMain.handle('config', async (_, key) => {
    return storage.get(key);
  });

  TCPClient.on('data', (data) => {
    mainWindow.webContents.send('tcp_data', data.toString('ascii'));

    console.log(data.toString('ascii'));
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.jules010209');

  try {
    TCPClient.connect(1130);
  } catch(err) {
    console.error(err);

    return new Notification({
      title: 'INTERCOM TCP ERROR',
      body: 'An error occurred during tcp connection'
    }).show();
  }

  TCPClient.on('error', (err) => {
    console.error(err);

    return new Notification({
      title: 'INTERCOM TCP ERROR',
      body: 'An error occurred during tcp connection'
    }).show();
  });

  TCPClient.on('close', () => {
    console.log('Disconected from TCP Server!');

    return new Notification({
      title: 'INTERCOM TCP ERROR',
      body: 'Disconected from TCP server'
    }).show();
  });

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  });

  createWindow();

  app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0) createWindow();
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
})
autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';

  console.log(log_message);
});

autoUpdater.on('update-downloaded', (_) => {
  console.log('Update downloaded');
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') app.quit();
});