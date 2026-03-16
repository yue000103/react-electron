const { app, BrowserWindow } = require("electron");
const path = require("path");

console.log("hello");

async function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        kiosk: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    await win.webContents.session.clearCache();
    await win.webContents.session.clearStorageData();

    await win.loadFile("index.html");
    win.webContents.reloadIgnoringCache();

    // win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.disableHardwareAcceleration();