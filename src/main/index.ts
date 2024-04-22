import { app, shell, BrowserWindow, ipcMain, Notification } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import * as net from 'net';
import Store from 'electron-store';

export const TCPClient = new net.Socket();

export const storage = new Store({ watch: true });

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
  })

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
  electronApp.setAppUserModelId('com.electron');

  try {
    TCPClient.connect(1130, () => {
      console.log('Connected TCP!');
    });
  } catch(err) {
    console.error(err);

    return new Notification({
      title: 'TCP ERROR',
      body: 'An error occurred during tcp connection'
    }).show();
  }

  TCPClient.on('error', (err) => {
    console.error(err);

    return new Notification({
      title: 'TCP ERROR',
      body: 'An error occurred during tcp connection'
    }).show();
  });

  TCPClient.on('close', () => {
    console.log('Disconected from TCP Server!');

    return new Notification({
      title: 'TCP ERROR',
      body: 'Disconected from TCP server'
    }).show();
  });

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  });

  ipcMain.on('ping', () => console.log('pong'))

  createWindow();

  app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') app.quit();
});