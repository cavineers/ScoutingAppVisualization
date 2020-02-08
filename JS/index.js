const electron = require('electron');
const url = require('url');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://localhost:27017/";
const express = require('express');
const bodyParser = require('body-parser');
const { ipcMain } = require('electron');

MongoClient.connect(mongoUrl, function(err, db) {
    if (err) throw err;
    var dbo = db.db("Scouting");
    let metrics = [];
    let visability = []
    dbo.collection("scouting-app").find().forEach(function(item) {
        console.log(item);
    });
});