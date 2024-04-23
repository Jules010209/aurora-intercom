import { app, shell, BrowserWindow, ipcMain, Notification } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import * as net from 'net';
import Store from 'electron-store';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';

export const TCPClient = new net.Socket();

export const storage = new Store({ watch: true });

autoUpdater.logger = log;

if(is.dev) {
  // Useful for some dev/debugging tasks, but download can
  // not be validated becuase dev app is not signed
  autoUpdater.updateConfigPath = join(__dirname, 'dev-app-update.yml');
}

log.info('App starting...');

let win: BrowserWindow;

const sendStatusToWindow = (text: string) => {
  log.info(text);
  win.webContents.send('message', text);
}

const createWindow = (): void => {
  win = new BrowserWindow({
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

  win.on('ready-to-show', () => {
    win.show();
  });

  win.webContents.ipc.on('send_data', (_, cmd) => {
    TCPClient.write(`#${cmd}\n`);
  });

  ipcMain.handle('config', async (_, key) => {
    return storage.get(key);
  });

  TCPClient.on('data', (data) => {
    win.webContents.send('tcp_data', data.toString('ascii'));
  });

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
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
  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', (_) => {
  sendStatusToWindow('Update available.');
});

autoUpdater.on('update-not-available', (_) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';

  sendStatusToWindow(log_message);
});

autoUpdater.on('update-downloaded', (_) => {
  sendStatusToWindow('Update downloaded');
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') app.quit();
});