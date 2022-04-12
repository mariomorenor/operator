"use strict";

import { app, protocol, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import { MenuItemConstructorOptions } from "electron/main";
const isDevelopment = process.env.NODE_ENV !== "production";

require("@electron/remote/main").initialize();

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

function createWindow({
  devPath = "",
  prodPath = "index.html",
  title = "Operator",
  devTools = false,
  width = 800,
  height = 600,
  modal = false,
  parent = undefined,
}: WindowProperties): BrowserWindow {
  // Create the browser window.
  const win = new BrowserWindow({
    width,
    height,
    title,
    parent,
    modal,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env
        .ELECTRON_NODE_INTEGRATION as unknown as boolean,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL((process.env.WEBPACK_DEV_SERVER_URL as string) + devPath);
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL(`app://./${prodPath}`);
  }

  if (devTools) win.webContents.openDevTools();

  return win;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e: any) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }

  mainWindow = createWindow({ devPath: "index" });
  mainWindow.setMenu(MainMenu);
  loginWindow = createWindow({
    devPath: "login",
    prodPath: "login.html",
    devTools: false,
    title: "Login",
    width: 400,
    height: 250,
    modal: true,
    parent: mainWindow,
  });
  loginWindow.setMenu(null);

  loginWindow.on("close", () => {
    app.quit();
  });

});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

// Interface para declarar las propiedades de una nueva ventana
interface WindowProperties {
  devPath?: string;
  prodPath?: string;
  width?: number;
  height?: number;
  title?: string;
  parent?: BrowserWindow | undefined;
  modal?: boolean;
  devTools?: boolean;
}

// Windows

let mainWindow: BrowserWindow;
let loginWindow: BrowserWindow;
let historyWindow: BrowserWindow | undefined;

// MENÚS

const devMenu: MenuItemConstructorOptions = {
  label: "Developer",
  submenu: [
    {
      label: "Tools",
      accelerator: "Ctrl+Shift+I",
      click() {
        mainWindow.webContents.toggleDevTools();
      },
    },
  ],
}

// Main Menú
const templateMainMenu: MenuItemConstructorOptions[] = [
  {
    label: "Archivo",
    submenu: [
      {
        type: "separator",
      },
      {
        label: "Cerrar Sesión",
        click() {
          dialog.showMessageBox(mainWindow, {
            title: "Cerrando Sesión...",
            message: "¿Está seguro de cerrar la sesión actual?",
            type: "question",
            buttons: ["Aceptar", "Cancelar"],
            noLink: true
          }).then(({ response }) => {
            if (response == 0) logout();
          })
        }
      },
    ]
  },
  {
    label: "Ventanas",
    submenu: [
      {
        label: "Historial",
        accelerator: "Ctrl+H",
        click() {
          if (historyWindow === undefined) {
            historyWindow = createWindow({
              devPath: "historial",
              prodPath: "historial.html",
              title: "Historial",
              height: 600,
              width: 900
            });
            historyWindow.setMenu(HistoryMenu)
            historyWindow.on("closed", () => historyWindow = undefined);
          } else {
            historyWindow.focus();
          }
        }
      }
    ]
  }
];

// Historial Menú
const templateHistoryMenu: MenuItemConstructorOptions[] = [];


// Menú para desarrolladores (Se deshabilita en PROD. automáticamente)
if (process.env.WEBPACK_DEV_SERVER_URL) {
  templateMainMenu.push(devMenu);
  templateHistoryMenu.push(devMenu);
}

// Se genera la plantilla de los menús
const MainMenu = Menu.buildFromTemplate(templateMainMenu);
const HistoryMenu = Menu.buildFromTemplate(templateHistoryMenu);

// EVENTS

ipcMain.on("login_successful", () => {
  loginWindow.hide();
  loginWindow.webContents.reload();
  mainWindow.focus();
  mainWindow.webContents.send("user:logged")
});



// FUNCTIONS

function logout() {
  if (historyWindow) historyWindow.close();
  mainWindow.webContents.reload();
  loginWindow.show();
}