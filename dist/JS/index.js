const electron = require('electron');
const url = require('url');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://localhost:27017/";
const express = require('express');
const bodyParser = require('body-parser');
const { ipcMain } = require('electron');

//MongoDB Collection Name
const collectionName = "scouting-app";

document.getElementById("item").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("inputBtn").click();
    }
});

function getForData() {
    document.getElementById('sortedDocs').innerHTML = 'Loading Results...';
    document.getElementById('loading').style.display = "block";
    let data = document.getElementById('item').value;
    MongoClient.connect(mongoUrl, function(err, db) {
        if (err) throw err;
        let teamNumbers = [];
        var dbo = db.db("Scouting");
        let teamData = dbo.collection(collectionName).find().forEach(function(docs) {
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
                    dbo.collection(collectionName).find(query).forEach(function(item) {
                        visability.push(item.metrics);
                        genData.push(item);
                    });
                    setTimeout(function() {
                        let delCells1 = 0;
                        let delCells2 = 0;
                        let delCells3 = 0;
                        let pikCells = 0;
                        let climb = 0;
                        let pins = 0;
                        let push = 0;
                        let disabled = 0;
                        let newData = 0; //newData = number of starting cells
                        for (let x = 0; x < visability.length; x++) {
                            pikCells = pikCells + visability[x].numberOfPickups;
                            delCells1 = delCells1 + visability[x].deliveriesLvl1;
                            delCells2 = delCells1 + visability[x].deliveriesLvl2;
                            delCells3 = delCells1 + visability[x].deliveriesLvl3;
                            pins = pins + visability[x].numPins;
                            push = push + visability[x].numPush;
                            disabled = disabled + visability[x].numDisrupted;
                            newData = newData + genData[x].startingCells;
                            if (visability[x].climb.match(/YES/g)) {
                                climb = climb + visability[x].climb.match(/YES/g).length || [];
                            }
                        }
                        pikCells = pikCells / visability.length
                        delCells1 = delCells1 / visability.length + newData;
                        delCells2 = delCells2 / visability.length + newData;
                        delCells3 = delCells3 / visability.length + newData;
                        newData = newData / visability.length;
                        pins = pins / visability.length;
                        push = push / visability.length;
                        disabled = disabled / visability.length;
                        climb = (climb / visability.length) * 100;
                        document.getElementById('sortedDocs').innerHTML = ` Average Stats for Team ${teamNumbers[i]}: <br><br>Metrics:<br> # of starting cells: ${newData} <br> # of Pickups: ${pikCells} <br> # of Delivers to Level 1: ${delCells1} <br> # of Delivers to Level 2: ${delCells2} <br> # of Delivers to Level 3: ${delCells3} <br> avg percent of climbs: ${climb}% <br><br> Defense: <br> # of Pins ${pins} <br> # of Pushes ${push} <br> # of Disables ${disabled}`;
                        document.getElementById('loading').style.display = "none";
                    }, 1000);
                } else {
                    document.getElementById('sortedDocs').innerHTML = 'Running Error Scan...';
                }
            }
        }, 1000)
    });
}

function viewComments() {
    document.getElementById('sortedDocs').innerHTML = 'Loading Results...';
    document.getElementById('loading').style.display = "block";
    let data = document.getElementById('item').value;
    MongoClient.connect(mongoUrl, function(err, db) {
        if (err) throw err;
        let teamNumbers = [];
        var dbo = db.db("Scouting");
        let teamData = dbo.collection(collectionName).find().forEach(function(docs) {
            if (docs.teamNum.length == 7) {
                teamNumbers.push((docs.teamNum).substring(3, 7));
            } else {
                teamNumbers.push((docs.teamNum).substring(3, 6));
            }
        })
        setTimeout(function() {
            for (let i = 0; i < teamNumbers.length; i++) {
                if (data == teamNumbers[i]) {
                    let query = {
                        teamNum: `frc${teamNumbers[i]}`
                    };
                    let visability = []
                    dbo.collection(collectionName).find(query).forEach(function(item) {
                        visability.push(item.SummaryData);
                    });
                    setTimeout(function() {
                        let defsenseComments = '';
                        let comments = '';
                        let safetyComments = '';
                        for (let x = 0; x < visability.length; x++) {
                            defsenseComments = defsenseComments + '<br>' + visability[x].DefenseComments;
                            comments = comments + '<br>' + visability[x].Comments;
                            safetyComments = safetyComments + '<br>' + visability[x].SafetyComments;
                        }
                        document.getElementById('sortedDocs').innerHTML = "<b>Defense Comments:</b> " + defsenseComments + "<br><b>Comments: </b>" + comments + '<br><b>Safety Comments: </b>' + safetyComments;
                        document.getElementById('loading').style.display = "none";
                    }, 1000);
                }
            }
        }, 1000);
    })
}

function viewAllComments() {
    document.getElementById('rankingData').innerHTML = 'Loading Results...';
    let data = document.getElementById('item').value;
    MongoClient.connect(mongoUrl, function(err, db) {
        if (err) throw err;
        let teamNumbers = [];
        var dbo = db.db("Scouting");
        let teamData = dbo.collection(collectionName).find().forEach(function(docs) {
            if (docs.teamNum.length == 7) {
                teamNumbers.push((docs.teamNum).substring(3, 7));
            } else {
                teamNumbers.push((docs.teamNum).substring(3, 6));
            }
        })
        setTimeout(function() {
            for (let i = 0; i < teamNumbers.length; i++) {
                let visability = []
                dbo.collection(collectionName).find().forEach(function(item) {
                    visability.push(item.SummaryData);
                });
                setTimeout(function() {
                    let defsenseComments = '';
                    let comments = '';
                    let safetyComments = '';
                    for (let x = 0; x < visability.length; x++) {
                        defsenseComments = defsenseComments + '<br>' + visability[x].DefenseComments;
                        comments = comments + '<br>' + visability[x].Comments;
                        safetyComments = safetyComments + '<br>' + visability[x].SafetyComments;
                    }
                    document.getElementById('rankingData').innerHTML = "<b>Defense Comments:</b> " + defsenseComments + "<br><b>Comments: </b>" + comments + '<br><b>Safety Comments: </b>' + safetyComments;
                }, 1000);
            }
        }, 1000);
    })
}

function getTeamNums() {
    document.getElementById('rankingData').innerHTML = 'Loading Results...';
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
            let teamNums = '';
            let unique = teamNumbers.filter(function(elem, index, self) {
                return index === self.indexOf(elem);
            });
            for (var i = 0; i < unique.length; i++) {
                if (i == 0) {
                    teamNums = teamNums + ' ' + unique[i]
                } else {
                    teamNums = teamNums + ', ' + unique[i]
                }
            }
            document.getElementById('rankingData').innerHTML = 'Team: ' + teamNums;
        }, 1000);
    })
}

function allianceCompare() {
    let team1 = document.getElementById('team1').value;
    let team2 = document.getElementById('team2').value;
    let dataPos = [];
    document.getElementById('loading2').style.display = "block";
    document.getElementById('rankingData').innerHTML = "Searching for Results";
    document.getElementById('compare2').innerHTML = "";
    MongoClient.connect(mongoUrl, function(err, db) {
        if (err) throw err;
        let teamNumbers = [];
        var dbo = db.db("Scouting");
        let teamData = dbo.collection(collectionName).find().forEach(function(docs) {
            if (docs.teamNum.length == 7) {
                teamNumbers.push((docs.teamNum).substring(3, 7));
            } else {
                teamNumbers.push((docs.teamNum).substring(3, 6));
            }
        })
        setTimeout(function() {
            let genData = [];
            for (let i = 0; i < teamNumbers.length; i++) {
                if (team1 == teamNumbers[i]) {
                    let query = {
                        teamNum: `frc${teamNumbers[i]}`
                    };
                    let visability = []
                    dbo.collection(collectionName).find(query).forEach(function(item) {
                        visability.push(item.metrics);
                        genData.push(item);
                    });
                    setTimeout(function() {
                        let delCells1 = 0;
                        let delCells2 = 0;
                        let delCells3 = 0;
                        let pikCells = 0;
                        let climb = 0;
                        let pins = 0;
                        let push = 0;
                        let disabled = 0;
                        let newData = 0; //newData = number of starting cells
                        for (let x = 0; x < visability.length; x++) {
                            pikCells = pikCells + visability[x].numberOfPickups;
                            delCells1 = delCells1 + visability[x].deliveriesLvl1;
                            delCells2 = delCells1 + visability[x].deliveriesLvl2;
                            delCells3 = delCells1 + visability[x].deliveriesLvl3;
                            pins = pins + visability[x].numPins;
                            push = push + visability[x].numPush;
                            disabled = disabled + visability[x].numDisrupted;
                            newData = newData + genData[x].startingCells;
                            if (visability[x].climb.match(/YES/g)) {
                                climb = climb + visability[x].climb.match(/YES/g).length || [];
                            }
                        }
                        pikCells = pikCells / visability.length
                        delCells1 = delCells1 / visability.length + newData;
                        delCells2 = delCells2 / visability.length + newData;
                        delCells3 = delCells3 / visability.length + newData;
                        newData = newData / visability.length;
                        pins = pins / visability.length;
                        push = push / visability.length;
                        disabled = disabled / visability.length;
                        climb = (climb / visability.length) * 100;
                        dataPos.push(teamNumbers[i]);
                        dataPos.push(newData);
                        dataPos.push(pikCells);
                        dataPos.push(delCells1);
                        dataPos.push(delCells2);
                        dataPos.push(delCells3);
                        dataPos.push(climb);
                        dataPos.push(pins);
                        dataPos.push(push);
                        dataPos.push(disabled);
                        document.getElementById('rankingData').innerHTML = ` Average Stats for Team ${teamNumbers[i]}: <br><br>Metrics:<br> # of starting cells: ${newData} <br> # of Pickups: ${pikCells} <br> # of Delivers to Level 1: ${delCells1} <br> # of Delivers to Level 2: ${delCells2} <br> # of Delivers to Level 3: ${delCells3} <br> avg percent of climbs: ${climb}% <br><br> Defense: <br> # of Pins ${pins} <br> # of Pushes ${push} <br> # of Disables ${disabled}`;
                        document.getElementById('loading2').style.display = "none";
                    }, 1000);
                } else {
                    document.getElementById('rankingData').innerHTML = 'Parsing...';
                }
            }
            let genData2 = [];
            for (let i = 0; i < teamNumbers.length; i++) {
                if (team2 == teamNumbers[i]) {
                    let query = {
                        teamNum: `frc${teamNumbers[i]}`
                    };
                    let visability = []
                    dbo.collection(collectionName).find(query).forEach(function(item) {
                        visability.push(item.metrics);
                        genData2.push(item);
                    });
                    setTimeout(function() {
                        let delCells1 = 0;
                        let delCells2 = 0;
                        let delCells3 = 0;
                        let pikCells = 0;
                        let climb = 0;
                        let pins = 0;
                        let push = 0;
                        let disabled = 0;
                        let newData = 0; //newData = number of starting cells
                        for (let x = 0; x < visability.length; x++) {
                            pikCells = pikCells + visability[x].numberOfPickups;
                            delCells1 = delCells1 + visability[x].deliveriesLvl1;
                            delCells2 = delCells1 + visability[x].deliveriesLvl2;
                            delCells3 = delCells1 + visability[x].deliveriesLvl3;
                            pins = pins + visability[x].numPins;
                            push = push + visability[x].numPush;
                            disabled = disabled + visability[x].numDisrupted;
                            newData = newData + genData2[x].startingCells;
                            if (visability[x].climb.match(/YES/g)) {
                                climb = climb + visability[x].climb.match(/YES/g).length || [];
                            }
                        }
                        pikCells = pikCells / visability.length
                        delCells1 = delCells1 / visability.length + newData;
                        delCells2 = delCells2 / visability.length + newData;
                        delCells3 = delCells3 / visability.length + newData;
                        newData = newData / visability.length;
                        pins = pins / visability.length;
                        push = push / visability.length;
                        disabled = disabled / visability.length;
                        climb = (climb / visability.length) * 100;
                        /* if (dataPos[2] > pikCells) {
                             document.getElementById('compare2').innerHTML = ` Average Stats for Team ${teamNumbers[i]}: <br><br>Metrics:<br> # of starting cells: ${newData} <br> # of Pickups: <span style="color: red;">${pikCells}</span> <br> # of Delivers to Level 1: ${delCells1} <br> # of Delivers to Level 2: ${delCells2} <br> # of Delivers to Level 3: ${delCells3} <br> avg percent of climbs: ${climb}% <br><br> Defense: <br> # of Pins ${pins} <br> # of Pushes ${push} <br> # of Disables ${disabled}`;
                             document.getElementById('rankingData').innerHTML = ` Average Stats for Team ${dataPos[0]}: <br><br>Metrics:<br> # of starting cells: ${dataPos[1]} <br> # of Pickups: <span style="color: green;">${dataPos[2]}</span> <br> # of Delivers to Level 1: ${dataPos[3]} <br> # of Delivers to Level 2: ${dataPos[4]} <br> # of Delivers to Level 3: ${dataPos[5]} <br> avg percent of climbs: ${dataPos[6]}% <br><br> Defense: <br> # of Pins ${dataPos[7]} <br> # of Pushes ${dataPos[8]} <br> # of Disables ${dataPos[9]}`;
                         } else {
                             document.getElementById('compare2').innerHTML = ` Average Stats for Team ${teamNumbers[i]}: <br><br>Metrics:<br> # of starting cells: ${newData} <br> # of Pickups: <span style="color: green;">${pikCells}</span> <br> # of Delivers to Level 1: ${delCells1} <br> # of Delivers to Level 2: ${delCells2} <br> # of Delivers to Level 3: ${delCells3} <br> avg percent of climbs: ${climb}% <br><br> Defense: <br> # of Pins ${pins} <br> # of Pushes ${push} <br> # of Disables ${disabled}`;
                         } */
                        document.getElementById('compare2').innerHTML = ` Average Stats for Team ${teamNumbers[i]}: <br><br>Metrics:<br> # of starting cells: ${newData} <br> # of Pickups: ${pikCells} <br> # of Delivers to Level 1: ${delCells1} <br> # of Delivers to Level 2: ${delCells2} <br> # of Delivers to Level 3: ${delCells3} <br> avg percent of climbs: ${climb}% <br><br> Defense: <br> # of Pins ${pins} <br> # of Pushes ${push} <br> # of Disables ${disabled}`;
                    }, 1000);
                }
            }
        }, 1000)
    });
}