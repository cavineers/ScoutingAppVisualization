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
            if (docs.teamNum.length == 7) {
                teamNumbers.push((docs.teamNum).substring(3, 7));
            } else {
                teamNumbers.push((docs.teamNum).substring(3, 6));
            }
        })
        setTimeout(function() {
            let genData = [];
            for (let i = 0; i < teamNumbers.length; i++) {
                if (data == teamNumbers[i]) {
                    let query = {
                        teamNum: `frc${teamNumbers[i]}`
                    };
                    let visability = []
                    dbo.collection("scouting-app").find(query).forEach(function(item) {
                        visability.push(item.metrics);
                        genData.push(item);
                    });
                    setTimeout(function() {
                        let delCells1 = 0;
                        let delCells2 = 0;
                        let delCells3 = 0;
                        let pikCells = 0;
                        let climb = 0;
                        let newData = 0; //newData = number of starting cells
                        for (let x = 0; x < visability.length; x++) {
                            pikCells = pikCells + visability[x].numberOfPickups;
                            delCells1 = delCells1 + visability[x].deliveriesLvl1;
                            delCells2 = delCells1 + visability[x].deliveriesLvl2;
                            delCells3 = delCells1 + visability[x].deliveriesLvl3;
                            newData = newData + genData[x].startingCells;
                            if (visability[x].climb.match(/YES/g)) {
                                climb = climb + visability[x].climb.match(/YES/g).length || [];
                            }
                            console.log(newData)
                        }
                        pikCells = pikCells / visability.length
                        delCells1 = delCells1 / visability.length + newData;
                        delCells2 = delCells2 / visability.length + newData;
                        delCells3 = delCells3 / visability.length + newData;
                        newData = newData / visability.length;
                        climb = (climb / visability.length) * 100;
                        document.getElementById('sortedDocs').innerHTML = ` Average Stats for Team ${teamNumbers[i]}: <br> # of starting cells: ${newData} <br> # of Pickups: ${pikCells} <br> # of Delivers to Level 1: ${delCells1} <br> # of Delivers to Level 2: ${delCells2} <br> # of Delivers to Level 3: ${delCells3} <br> avg percent of climbs: ${climb}%`;
                    }, 800);
                }
            }
        }, 800)
    });
}