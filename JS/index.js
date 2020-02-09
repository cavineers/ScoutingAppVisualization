const electron = require('electron');
const url = require('url');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://localhost:27017/";
const express = require('express');
const bodyParser = require('body-parser');
const { ipcMain } = require('electron');

function getForData() {
    document.getElementById('sortedDocs').innerHTML = "Loading Results...";
    let data = document.getElementById('item').value;
    MongoClient.connect(mongoUrl, function(err, db) {
        if (err) throw err;
        let teamNumbers = [];
        var dbo = db.db("Scouting");
        let teamData = dbo.collection("scouting-app").find().forEach(function(docs) {
            teamNumbers.push((docs.teamNum).substring(3, 7));
        })
        setTimeout(function() {
            for (let i = 0; i < teamNumbers.length; i++) {
                if (data == teamNumbers[i]) {
                    let query = {
                        teamNum: `frc${teamNumbers[i]}`
                    };
                    let visability = []
                    dbo.collection("scouting-app").find(query).forEach(function(item) {
                        visability.push(item.metrics);
                    });
                    console.log(visability)
                    setTimeout(function() {
                        let delCells1 = 0;
                        let pikCells = 0;
                        let climb = 0;
                        let visX = 0;
                        console.log(visability.length)
                        for (let x = 0; x < visability.length; x++) {
                            pikCells = pikCells + visability[x].numberOfPickups;
                            delCells1 = delCells1 + visability[x].deliveriesLvl1;
                        }
                        pikCells = pikCells / visability.length
                        delCells1 = delCells1 / visability.length;
                        document.getElementById('sortedDocs').innerHTML = ` Average Stats for Team ${teamNumbers[i]}: <br> # of Pickups: ${pikCells} <br> # of Delivers to Level 1: ${delCells1}`;
                    }, 800);
                }
            }
        }, 800)
    });
}