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
                        let stage2 = 0;
                        let stage3 = 0;
                        let newData = 0; //newData = number of starting cells
                        for (let x = 0; x < visability.length; x++) {
                            pikCells = pikCells + visability[x].numberOfPickups;
                            delCells1 = delCells1 + visability[x].deliveriesLvl1;
                            delCells2 = delCells2 + visability[x].deliveriesLvl2;
                            delCells3 = delCells3 + visability[x].deliveriesLvl3;
                            pins = pins + visability[x].numPins;
                            push = push + visability[x].numPush;
                            disabled = disabled + visability[x].numDisrupted;
                            newData = newData + genData[x].startingCells;
                            if (visability[x].climb.match(/YES/g)) {
                                climb = climb + visability[x].climb.match(/YES/g).length || [];
                            }
                            if (visability[x].stage2_control.match(/Spun_3-5_times/g)) {
                                stage2 = stage2 + visability[x].stage2_control.match(/Spun_3-5_times/g).length || [];
                            }
                            if (visability[x].stage3_control.match(/LandedOnColor/g)) {
                                stage3 = stage3 + visability[x].stage3_control.match(/LandedOnColor/g).length || [];
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
                        stage2 = (stage2 / visability.length) * 100;
                        stage3 = (stage3 / visability.length) * 100;
                        document.getElementById('sortedDocs').innerHTML = ` Average Stats for Team ${teamNumbers[i]}: <br><br>Metrics:<br> # of starting cells: ${newData} <br> # of Pickups: ${pikCells} <br> # of Delivers to Level 1: ${delCells1} <br> # of Delivers to Level 2: ${delCells2} <br> # of Delivers to Level 3: ${delCells3} <br> avg percent of climbs: ${climb}%<br> avg percent of stage 2 (3-5): ${stage2}%<br> avg percent of landing on correct color: ${stage3}% <br><br> Defense: <br> # of Pins ${pins} <br> # of Pushes ${push} <br> # of Disables ${disabled}`;
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
    document.getElementById('compare2').innerHTML = "";
    document.getElementById('compare3').innerHTML = "";
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
    document.getElementById('compare2').innerHTML = "";
    document.getElementById('compare3').innerHTML = "";
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
    document.getElementById('compare3').innerHTML = "";
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
                        let stage2 = 0;
                        let stage3 = 0;
                        let newData = 0; //newData = number of starting cells
                        for (let x = 0; x < visability.length; x++) {
                            pikCells = pikCells + visability[x].numberOfPickups;
                            delCells1 = delCells1 + visability[x].deliveriesLvl1;
                            delCells2 = delCells2 + visability[x].deliveriesLvl2;
                            delCells3 = delCells3 + visability[x].deliveriesLvl3;
                            pins = pins + visability[x].numPins;
                            push = push + visability[x].numPush;
                            disabled = disabled + visability[x].numDisrupted;
                            newData = newData + genData[x].startingCells;
                            if (visability[x].climb.match(/YES/g)) {
                                climb = climb + visability[x].climb.match(/YES/g).length || [];
                            }
                            if (visability[x].stage2_control.match(/Spun_3-5_times/g)) {
                                stage2 = stage2 + visability[x].stage2_control.match(/Spun_3-5_times/g).length || [];
                            }
                            if (visability[x].stage3_control.match(/LandedOnColor/g)) {
                                stage3 = stage3 + visability[x].stage3_control.match(/LandedOnColor/g).length || [];
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
                        stage2 = (stage2 / visability.length) * 100;
                        stage3 = (stage3 / visability.length) * 100;
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
                        dataPos.push(stage2);
                        dataPos.push(stage3);
                        // document.getElementById('rankingData').innerHTML = ` Average Stats for Team ${teamNumbers[i]}: <br><br>Metrics:<br> # of starting cells: ${newData} <br> # of Pickups: ${pikCells} <br> # of Delivers to Level 1: ${delCells1} <br> # of Delivers to Level 2: ${delCells2} <br> # of Delivers to Level 3: ${delCells3} <br> avg percent of climbs: ${climb}%<br> avg percent of stage 2 (3-5): ${stage2}%<br> avg percent of landing on correct color: ${stage3}% <br><br> Defense: <br> # of Pins ${pins} <br> # of Pushes ${push} <br> # of Disables ${disabled}`;
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
                        let stage2 = 0;
                        let stage3 = 0;
                        let newData = 0; //newData = number of starting cells
                        let countTeam1 = 0;
                        let countTeam2 = 0;
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
                            if (visability[x].stage2_control.match(/Spun_3-5_times/g)) {
                                stage2 = stage2 + visability[x].stage2_control.match(/Spun_3-5_times/g).length || [];
                            }
                            if (visability[x].stage3_control.match(/LandedOnColor/g)) {
                                stage3 = stage3 + visability[x].stage3_control.match(/LandedOnColor/g).length || [];
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
                        stage2 = (stage2 / visability.length) * 100;
                        stage3 = (stage3 / visability.length) * 100;
                        if (dataPos[2] > pikCells && dataPos[2] != pikCells) {
                            countTeam1++;
                        } else if (dataPos[2] != pikCells) {
                            countTeam2++;
                        }
                        if (dataPos[3] > delCells1 && dataPos[3] != delCells1) {
                            countTeam1++;
                        } else if (dataPos[3] != delCells1) {
                            countTeam2++;
                        }
                        if (dataPos[4] > delCells2 && dataPos[4] != delCells2) {
                            countTeam1++;
                        } else if (dataPos[4] != delCells2) {
                            countTeam2++;
                        }
                        if (dataPos[5] > delCells3 && dataPos[5] != delCells3) {
                            countTeam1++;
                        } else if (dataPos[5] != delCells3) {
                            countTeam2++;
                        }
                        if (dataPos[6] > climb && dataPos[6] != climb) {
                            countTeam1++;
                        } else if (dataPos[6] != climb) {
                            countTeam2++;
                        }
                        if (dataPos[7] > pins && dataPos[7] != pins) {
                            countTeam1++;
                        } else if (dataPos[7] != pins) {
                            countTeam2++;
                        }
                        if (dataPos[8] > push && dataPos[8] != push) {
                            countTeam1++;
                        } else if (dataPos[8] != push) {
                            countTeam2++;
                        }
                        if (dataPos[9] > disabled && dataPos[9] != disabled) {
                            countTeam1++;
                        } else if (dataPos[9] != disabled) {
                            countTeam2++;
                        }
                        if (dataPos[10] > stage2 && dataPos[10] != stage2) {
                            countTeam1++;
                        } else if (dataPos[10] != stage2) {
                            countTeam2++;
                        }
                        if (dataPos[11] > stage3 && dataPos[11] != stage3) {
                            countTeam1++;
                        } else if (dataPos[11] != stage3) {
                            countTeam2++;
                        }
                        let discountedScore = 0;
                        discountedScore = 10 - (countTeam1 + countTeam2);
                        if (countTeam1 > countTeam2) {
                            document.getElementById('rankingData').innerHTML = `<span style="color: green">Average Stats for Team ${dataPos[0]}:</span><br><br>Metrics:<br> # of starting cells: ${dataPos[1]} <br> # of Pickups: ${dataPos[2]} <br> # of Delivers to Level 1: ${dataPos[3]} <br> # of Delivers to Level 2: ${dataPos[4]} <br> # of Delivers to Level 3: ${dataPos[5]} <br> avg percent of climbs: ${dataPos[6]}%<br> avg percent of stage 2 (3-5): ${dataPos[10]}%<br> avg percent of landing on correct color: ${dataPos[11]}% <br><br> Defense: <br> # of Pins ${dataPos[7]} <br> # of Pushes ${dataPos[8]} <br> # of Disables ${dataPos[9]}<br><br>This team received a score of ${countTeam1} out of ${10 - discountedScore}`;
                            document.getElementById('compare2').innerHTML = `<span style="color: red">Average Stats for Team ${teamNumbers[i]}:</span><br><br>Metrics:<br> # of starting cells: ${newData} <br> # of Pickups: ${pikCells} <br> # of Delivers to Level 1: ${delCells1} <br> # of Delivers to Level 2: ${delCells2} <br> # of Delivers to Level 3: ${delCells3} <br> avg percent of climbs: ${climb}%<br> avg percent of stage 2 (3-5): ${stage2}%<br> avg percent of landing on correct color: ${stage3}% <br><br> Defense: <br> # of Pins ${pins} <br> # of Pushes ${push} <br> # of Disables ${disabled}<br><br>This team received a score of ${countTeam2} out of ${10 - discountedScore}`;
                            document.getElementById('compare3').innerHTML = `Scoring:<br><br>Between these two teams ${discountedScore} was removed when scoring due to duplicate values<br><br>Team ${dataPos[0]} scored a ${countTeam1} VS Team ${teamNumbers[i]} who scored a ${countTeam2} out of ${10 - discountedScore}`;
                        } else {
                            document.getElementById('rankingData').innerHTML = `<span style="color: red">Average Stats for Team ${dataPos[0]}:</span><br><br>Metrics:<br> # of starting cells: ${dataPos[1]} <br> # of Pickups: ${dataPos[2]} <br> # of Delivers to Level 1: ${dataPos[3]} <br> # of Delivers to Level 2: ${dataPos[4]} <br> # of Delivers to Level 3: ${dataPos[5]} <br> avg percent of climbs: ${dataPos[6]}%<br> avg percent of stage 2 (3-5): ${dataPos[10]}%<br> avg percent of landing on correct color: ${dataPos[11]}% <br><br> Defense: <br> # of Pins ${dataPos[7]} <br> # of Pushes ${dataPos[8]} <br> # of Disables ${dataPos[9]}<br><br>This team received a score of ${countTeam1} out of ${10 - discountedScore}`;
                            document.getElementById('compare2').innerHTML = `<span style="color: green">Average Stats for Team ${teamNumbers[i]}:</span><br><br>Metrics:<br> # of starting cells: ${newData} <br> # of Pickups: ${pikCells} <br> # of Delivers to Level 1: ${delCells1} <br> # of Delivers to Level 2: ${delCells2} <br> # of Delivers to Level 3: ${delCells3} <br> avg percent of climbs: ${climb}%<br> avg percent of stage 2 (3-5): ${stage2}%<br> avg percent of landing on correct color: ${stage3}% <br><br> Defense: <br> # of Pins ${pins} <br> # of Pushes ${push} <br> # of Disables ${disabled}<br><br>This team received a score of ${countTeam2} out of ${10 - discountedScore}`;
                            document.getElementById('compare3').innerHTML = `Scoring:<br><br>Between these two teams ${discountedScore} was removed when scoring due to duplicate values<br><br>Team ${dataPos[0]} scored a ${countTeam1} VS Team ${teamNumbers[i]} who scored a ${countTeam2} out of ${10 - discountedScore}`;
                        }
                    }, 1000);
                }
            }
        }, 1000)
    });
}

function baseLine() {
    document.getElementById('loading2').style.display = "block";
    document.getElementById('rankingData').innerHTML = "Parsing Data...";
    document.getElementById('compare2').innerHTML = "";
    document.getElementById('compare3').innerHTML = "";
    MongoClient.connect(mongoUrl, function(err, db) {
        if (err) throw err;
        let pikCells = [];
        let delCells1 = [];
        let delCells2 = [];
        let delCells3 = [];
        let climb = 0;
        let pins = [];
        let push = [];
        let disabled = [];
        let stage2 = 0;
        let stage3 = 0;
        var dbo = db.db("Scouting");
        let teamData = dbo.collection(collectionName).find().forEach(function(docs) {
            pikCells.push(docs.metrics.numberOfPickups);
            delCells1.push(docs.metrics.deliveriesLvl1);
            delCells2.push(docs.metrics.deliveriesLvl2);
            delCells3.push(docs.metrics.deliveriesLvl3);
            if (docs.metrics.climb.match(/YES/g)) {
                climb = climb + docs.metrics.climb.match(/YES/g).length || [];
            }
            if (docs.metrics.stage2_control.match(/Spun_3-5_times/g)) {
                stage2 = stage2 + docs.metrics.stage2_control.match(/Spun_3-5_times/g).length || [];
            }
            if (docs.metrics.stage3_control.match(/LandedOnColor/g)) {
                stage3 = stage3 + docs.metrics.stage3_control.match(/LandedOnColor/g).length || [];
            }
            pins.push(docs.metrics.numPins);
            push.push(docs.metrics.numPush);
            disabled.push(docs.metrics.numDisrupted);
        });
        setTimeout(function() {
            let pikCellsParse = 0;
            let delCells1Parse = 0;
            let delCells2Parse = 0;
            let delCells3Parse = 0;
            let pinsParse = 0;
            let pushParse = 0;
            let disabledParse = 0;
            let length = 0;
            for (let i = 0; i < pikCells.length; i++) {
                pikCellsParse = pikCellsParse + pikCells[i];
                delCells1Parse = delCells1Parse + delCells1[i];
                delCells2Parse = delCells2Parse + delCells2[i];
                delCells3Parse = delCells3Parse + delCells3[i];
                pinsParse = pinsParse + pins[i];
                pushParse = pushParse + push[i];
                disabledParse = disabledParse + disabled[i];
                length = i + 1;
            }
            pikCellsParse = pikCellsParse / length;
            delCells1Parse = delCells1Parse / length;
            delCells2Parse = delCells2Parse / length;
            delCells3Parse = delCells3Parse / length;
            pinsParse = pinsParse / length;
            pushParse = pushParse / length;
            disabledParse = disabledParse / length;
            climb = (climb / length) * 100;
            stage2 = (stage2 / length) * 100;
            stage3 = (stage3 / length) * 100;
            document.getElementById('rankingData').innerHTML = `<span style="font-size: 24px;">Average Pick Ups: <span style="color: yellow;">${pikCellsParse}</span><br>Average Delivers to Level 1: <span style="color: yellow;">${delCells1Parse}</span><br>Average Delivers to Level 2: <span style="color: yellow;">${delCells2Parse}</span><br>Average Delivers to Level 3: <span style="color: yellow;">${delCells3Parse}</span><br>Average Stage 2 Spin (3-5): <span style="color: yellow;">${stage2}%</span><br>Average Lands on Correct Color: <span style="color: yellow">${stage3}%</span><br>Average Climb: <span style="color: yellow;">${climb}%</span><br>Average Pins: <span style="color: rgb(3, 223, 252);">${pinsParse}</span><br>Average Push: <span style="color: rgb(3, 223, 252);">${pushParse}</span><br>Average Disables: <span style="color: rgb(3, 223, 252);">${disabledParse}</span></span>`;
            document.getElementById('loading2').style.display = "none";
        }, 900);
    })
}