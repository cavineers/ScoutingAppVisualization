const electron = require('electron');
const url = require('url');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://localhost:27017/";
const express = require('express');
const bodyParser = require('body-parser');
const { ipcMain } = require('electron');

let expressApp = express;

const { app, BrowserWindow, Menu } = electron;

let mainWindow;

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    //Loads HTML
    mainWindow.loadURL(path.join(__dirname, '/dist/index.html'))

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

const mainMenuTemplate = [{
        label: 'File ',
        submenu: [{
                label: 'Quit',
                click() {
                    app.quit();
                }
            },
            {
                label: 'Reload',
                click() {
                    mainWindow.reload()
                }
            }
        ],
    },
    {
        label: 'Developer Tools ',
        submenu: [{
            label: 'Toggle Dev Tools',
            click(item, focusedWindow) {
                focusedWindow.toggleDevTools();
            }
        }]
    }
]

MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Scouting");
    let metrics = [];
    let visability = []
    dbo.collection("scouting-app").find().forEach(function(item) {
        metrics.push(JSON.stringify(item.teamNum + ': ' + item.metrics + ' '));
        visability.push(JSON.stringify(item.teamNum));
    });
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('ping', metrics)
    })
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('loadFiles', visability)
    })
});