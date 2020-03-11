const electron = require('electron');
const url = require('url');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://localhost:27017/";
const express = require('express');
const bodyParser = require('body-parser');
const { ipcMain } = require('electron');

//MongoDB Collection Name
let collectionName = "OwingsMills";
document.getElementById('currKey').innerHTML = "Current Key: " + collectionName;

function changeKey() {
    let collectionDropDown = document.getElementById('keyEven').value;

    if (collectionDropDown == "Week_0") {
        collectionName = "Week_0";
    } else if (collectionDropDown == "Week_1") {
        collectionName = "Week_1";
    } else if (collectionDropDown == "scouting-app") {
        collectionName = "scouting-app";
    } else if (collectionDropDown == "Week_2") {
        collectionName = "Week_2";
    } else if (collectionDropDown == "OwingsMills") {
        collectionName = "OwingsMills";
    }
    document.getElementById('currKey').innerHTML = "Current Key: " + collectionName;
}

document.getElementById("item").addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("inputBtn").click();
    }
});

let pikCellsParse = 0;
let delCells1Parse = 0;
let delCells2Parse = 0;
let delCells3Parse = 0;
let pinsParse = 0;
let pushParse = 0;
let disabledParse = 0;
let climbParse = 0;
let stage2Parse = 0;
let stage3Parse = 0;

function getForData() {
    document.getElementById('sortedDocs').innerHTML = 'Loading Results...';
    document.getElementById('loading').style.display = "block";
    let data = document.getElementById('item').value;
    if (data != "") {
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
                baseLineData2();
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
                            let numMatch = 0;
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
                                numMatch++;
                            }
                            pikCells = pikCells / visability.length
                            delCells1 = delCells1 / visability.length;
                            delCells2 = delCells2 / visability.length;
                            delCells3 = delCells3 / visability.length;
                            newData = newData / visability.length;
                            pins = pins / visability.length;
                            push = push / visability.length;
                            disabled = disabled / visability.length;
                            climb = (climb / visability.length) * 100;
                            stage2 = (stage2 / visability.length) * 100;
                            stage3 = (stage3 / visability.length) * 100;
                            let countTeam1 = 0;
                            let countTeam2 = 0;
                            if (pikCellsParse > pikCells && pikCellsParse != pikCells) {
                                countTeam1++;
                            } else if (pikCellsParse != pikCells) {
                                countTeam2++;
                            }
                            if (delCells1Parse > delCells1 && delCells1Parse != delCells1) {
                                countTeam1++;
                            } else if (delCells1Parse != delCells1) {
                                countTeam2++;
                            }
                            if (delCells2Parse > delCells2 && delCells2Parse != delCells2) {
                                countTeam1++;
                            } else if (delCells2Parse != delCells2) {
                                countTeam2++;
                            }
                            if (delCells3Parse > delCells3 && delCells3Parse != delCells3) {
                                countTeam1++;
                            } else if (delCells3Parse != delCells3) {
                                countTeam2++;
                            }
                            if (pinsParse > pins && pinsParse != pins) {
                                countTeam1++;
                            } else if (pinsParse != pins) {
                                countTeam2++;
                            }
                            if (pushParse > push && pushParse != push) {
                                countTeam1++;
                            } else if (pushParse != push) {
                                countTeam2++;
                            }
                            if (disabledParse > disabled && disabledParse != disabled) {
                                countTeam1++;
                            } else if (disabledParse != disabled) {
                                countTeam2++;
                            }
                            if (climbParse > climb && climbParse != climb) {
                                countTeam1 += 2;
                            } else if (climbParse != climb) {
                                countTeam2 += 2;
                            } else if (climbParse == climb) {
                                countTeam1++;
                                countTeam2++;
                            }
                            if (stage2Parse > stage2 && stage2Parse != stage2) {
                                countTeam1++;
                            } else if (stage2Parse != stage2) {
                                countTeam2++;
                            }
                            if (stage3Parse > stage3 && stage3Parse != stage3) {
                                countTeam1++;
                            } else if (stage3Parse != stage3) {
                                countTeam2++;
                            }
                            let discountedScore = 0;
                            discountedScore = 11 - (countTeam1 + countTeam2);
                            if (countTeam1 > countTeam2) {
                                document.getElementById('sortedDocs').innerHTML = `<span style="color: red">Average Stats for Team ${teamNumbers[i]}:</span> (played in ${numMatch} match(es))<br><br>Metrics:<br> # of starting cells:<b> ${newData}</b><br> # of Pickups:<b> ${pikCells}</b> <br> # of Delivers to Level 1: <b>${delCells1}</b> <br> # of Delivers to Level 2: <b>${delCells2}</b> <br> # of Delivers to Level 3: <b>${delCells3}</b> <br> avg percent of climbs: <b>${climb}%</b><br> avg percent of stage 2 (3-5): <b>${stage2}%</b><br> avg percent of landing on correct color: <b>${stage3}%</b> <br><br> Defense: <br> # of Pins <b>${pins} </b> <br> # of Pushes <b>${push}</b> <br> # of Disables <b>${disabled}</b><br><br>This team received a score of <b>${countTeam2}</b> out of <b>${11 - discountedScore}</b> compared to the base line data<br>***CLIMB IS WORTH 2x POINTS (2 points) DUE TO ITS IMPORTANCE*** (without discounted points there is a total of 11)`;
                            } else {
                                document.getElementById('sortedDocs').innerHTML = `<span style="color: green">Average Stats for Team ${teamNumbers[i]}:</span><br><br>Metrics:<br> # of starting cells:<b> ${newData}</b> <br> # of Pickups:<b> ${pikCells}</b> <br> # of Delivers to Level 1: <b>${delCells1}</b> <br> # of Delivers to Level 2: <b>${delCells2}</b> <br> # of Delivers to Level 3: <b>${delCells3}</b> <br> avg percent of climbs: <b>${climb}%</b><br> avg percent of stage 2 (3-5): <b>${stage2}%</b><br> avg percent of landing on correct color: <b>${stage3}%</b> <br><br> Defense: <br> # of Pins <b>${pins}</b> <br> # of Pushes <b>${push}</b> <br> # of Disables <b>${disabled}</b><br><br>This team received a score of <b>${countTeam2}</b> out of <b>${11 - discountedScore}</b> compared to the base line data<br>***CLIMB IS WORTH 2x POINTS (2 points) DUE TO ITS IMPORTANCE*** (without discounted points there is a total of 11)`;
                            }
                            //document.getElementById('sortedDocs').innerHTML = ` Average Stats for Team ${teamNumbers[i]}: <br><br>Metrics:<br> # of starting cells: ${newData} <br> # of Pickups: ${pikCells} <br> # of Delivers to Level 1: ${delCells1} <br> # of Delivers to Level 2: ${delCells2} <br> # of Delivers to Level 3: ${delCells3} <br> avg percent of climbs: ${climb}%<br> avg percent of stage 2 (3-5): ${stage2}%<br> avg percent of landing on correct color: ${stage3}% <br><br> Defense: <br> # of Pins ${pins} <br> # of Pushes ${push} <br> # of Disables ${disabled}`;
                            document.getElementById('loading').style.display = "none";
                        }, 1500);
                    } else {
                        const msg = parseInt(Math.random() * 6 + 1);
                        if (msg == 1) {
                            document.getElementById('sortedDocs').innerHTML = 'Stuck In Loop HELP...';
                        } else if (msg == 2) {
                            document.getElementById('sortedDocs').innerHTML = 'Good Things Are Worth Waiting For!';
                        } else if (msg == 3) {
                            document.getElementById('sortedDocs').innerHTML = 'I noticed your having a bad hair day!';
                        } else if (msg == 4) {
                            document.getElementById('sortedDocs').innerHTML = 'Working hard to get your data perfect!';
                        } else if (msg == 6) {
                            document.getElementById('sortedDocs').innerHTML = 'Please Wash your hands I am afraid of getting a virus!';
                        } else {
                            document.getElementById('sortedDocs').innerHTML = 'Parsing...';
                        }
                        async function test() {
                            setTimeout(() => {
                                document.getElementById('sortedDocs').innerHTML = 'No Team Was Found';
                            }, 1482);
                        }
                        test();
                    }
                }
            }, 1000)
        });
    } else {
        document.getElementById('loading').style.display = "none";
        document.getElementById('sortedDocs').innerHTML = 'Please Select a team number';
    }
}

function getRanks() {
    const msg = parseInt(Math.random() * 6 + 1);
    if (msg == 1) {
        document.getElementById('rankingData').innerHTML = 'Stuck In Loop HELP...';
    } else if (msg == 2) {
        document.getElementById('rankingData').innerHTML = 'Good Things Are Worth Waiting For!';
    } else if (msg == 3) {
        document.getElementById('rankingData').innerHTML = 'Please Wait System Processing...';
    } else if (msg == 4) {
        document.getElementById('rankingData').innerHTML = 'Working hard to get your data perfect!';
    } else if (msg == 6) {
        document.getElementById('rankingData').innerHTML = 'Please Wash your hands I am afraid of getting a virus!';
    } else {
        document.getElementById('rankingData').innerHTML = 'Parsing.................';
    }
    document.getElementById('loading2').style.display = "block";
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
            baseLineData2();
            let score = [];
            let genData = [];
            let teamNums = [];
            let discountedScore = 0;
            let unique = teamNumbers.filter(function(elem, index, self) {
                return index === self.indexOf(elem);
            });
            for (var i = 0; i < unique.length; i++) {
                teamNums.push(unique[i]);
            }
            for (let i = 0; i < teamNums.length; i++) {
                let query = {
                    teamNum: `frc${teamNums[i]}`
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
                    delCells1 = delCells1 / visability.length;
                    delCells2 = delCells2 / visability.length;
                    delCells3 = delCells3 / visability.length;
                    newData = newData / visability.length;
                    pins = pins / visability.length;
                    push = push / visability.length;
                    disabled = disabled / visability.length;
                    climb = (climb / visability.length) * 100;
                    stage2 = (stage2 / visability.length) * 100;
                    stage3 = (stage3 / visability.length) * 100;
                    let countTeam1 = 0;
                    let countTeam2 = 0;
                    if (pikCellsParse > pikCells && pikCellsParse != pikCells) {
                        countTeam1++;
                    } else if (pikCellsParse != pikCells) {
                        countTeam2++;
                    }
                    if (delCells1Parse > delCells1 && delCells1Parse != delCells1) {
                        countTeam1++;
                    } else if (delCells1Parse != delCells1) {
                        countTeam2++;
                    }
                    if (delCells2Parse > delCells2 && delCells2Parse != delCells2) {
                        countTeam1++;
                    } else if (delCells2Parse != delCells2) {
                        countTeam2++;
                    }
                    if (delCells3Parse > delCells3 && delCells3Parse != delCells3) {
                        countTeam1++;
                    } else if (delCells3Parse != delCells3) {
                        countTeam2++;
                    }
                    if (pinsParse > pins && pinsParse != pins) {
                        countTeam1++;
                    } else if (pinsParse != pins) {
                        countTeam2++;
                    }
                    if (pushParse > push && pushParse != push) {
                        countTeam1++;
                    } else if (pushParse != push) {
                        countTeam2++;
                    }
                    if (disabledParse > disabled && disabledParse != disabled) {
                        countTeam1++;
                    } else if (disabledParse != disabled) {
                        countTeam2++;
                    }
                    if (climbParse > climb && climbParse != climb) {
                        countTeam1 += 2;
                    } else if (climbParse != climb) {
                        countTeam2 += 2;
                    } else if (climbParse == climb) {
                        countTeam1++;
                        countTeam2++;
                    }
                    if (stage2Parse > stage2 && stage2Parse != stage2) {
                        countTeam1++;
                    } else if (stage2Parse != stage2) {
                        countTeam2++;
                    }
                    if (stage3Parse > stage3 && stage3Parse != stage3) {
                        countTeam1++;
                    } else if (stage3Parse != stage3) {
                        countTeam2++;
                    }
                    discountedScore = 11 - (countTeam1 + countTeam2);
                    score.push({ "TeamNumber": teamNums[i], "score": countTeam2 })
                }, 1500);
            }
            setTimeout(() => {
                score.sort(function(a, b) { return b.score - a.score; });
                data = '';
                for (let i = 0; i < score.length; i++) {
                    if (score[i].score >= 10 - discountedScore) {
                        data += `<br><span style="color: green; font-size: 28px">${score[i].TeamNumber}: ${score[i].score} out of ${11 - discountedScore}</span>`;
                    } else if (score[i].score >= 8 - discountedScore) {
                        data += `<br><span style="color: yellow; font-size: 28px">${score[i].TeamNumber}: ${score[i].score} out of ${11 - discountedScore}</span>`;
                    } else if (score[i].score >= 6 - discountedScore) {
                        data += `<br><span style="color: rgb(255, 255, 151); font-size: 28px">${score[i].TeamNumber}: ${score[i].score} out of ${11 - discountedScore}</span>`;
                    } else {
                        data += `<br><span style="color: red; font-size: 28px">${score[i].TeamNumber}: ${score[i].score} out of ${11 - discountedScore}</span>`;
                    }
                }
                document.getElementById('rankingData').innerHTML = data;
                document.getElementById('compare2').innerHTML = '**Format is team number and then score compared to the BASE line**<br><br>Key:<br><span style="color: green;">Green</span> equals a perfect score<br><span style="color: yellow;">Yellow</span> equals a mostly perfect score (1 - 2 points from a perfect score)<br><span style="color: rgb(255, 255, 151);">Light Yellow</span> Average (3 - 4 points off score)<br><span style="color: red;">Red</span> Less than average (below 4 points off)<br><br>***CLIMB IS WORTH 2x POINTS (2 points) DUE TO ITS IMPORTANCE*** (without discounted points there is a total of 11)';
                document.getElementById('loading2').style.display = "none";
            }, 1600);
        }, 1000);
    })
}

function baseLineData2() {
    pikCellsParse = 0;
    delCells1Parse = 0;
    delCells2Parse = 0;
    delCells3Parse = 0;
    pinsParse = 0;
    pushParse = 0;
    disabledParse = 0;
    climbParse = 0;
    stage2Parse = 0;
    stage3Parse = 0;
    MongoClient.connect(mongoUrl, function(err, db) {
        if (err) throw err;
        let pikCells = [];
        let delCells1 = [];
        let delCells2 = [];
        let delCells3 = [];
        let pins = [];
        let push = [];
        let disabled = [];
        var dbo = db.db("Scouting");
        let teamData = dbo.collection(collectionName).find().forEach(function(docs) {
            pikCells.push(docs.metrics.numberOfPickups);
            delCells1.push(docs.metrics.deliveriesLvl1);
            delCells2.push(docs.metrics.deliveriesLvl2);
            delCells3.push(docs.metrics.deliveriesLvl3);
            if (docs.metrics.climb.match(/YES/g)) {
                climbParse++
            }
            if (docs.metrics.stage2_control.match(/Spun_3-5_times/g)) {
                stage2Parse++
            }
            if (docs.metrics.stage3_control.match(/LandedOnColor/g)) {
                stage3Parse++
            }
            pins.push(docs.metrics.numPins);
            push.push(docs.metrics.numPush);
            disabled.push(docs.metrics.numDisrupted);
        });
        setTimeout(function() {
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
            climbParse = (climbParse / length) * 100;
            stage2Parse = (stage2Parse / length) * 100;
            stage3Parse = (stage3Parse / length) * 100;
            //, delCells1Parse, delCells2Parse, delCells3Parse, climb, pinsParse, pushParse, disabledParse, stage2, stage3;
        }, 900);
    })
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
                        if (visability[x].DefenseComments == "") {} else {
                            defsenseComments = defsenseComments + '<br>' + teamNumbers[x] + ": " + visability[x].DefenseComments;
                        }
                        if (visability[x].Comments == "") {} else {
                            comments = comments + '<br>' + teamNumbers[x] + ": " + visability[x].Comments;
                        }
                        if (visability[x].SafetyComments == "") {} else {
                            safetyComments = safetyComments + '<br>' + teamNumbers[x] + ": " + visability[x].SafetyComments;
                        }
                    }
                    document.getElementById('rankingData').innerHTML = "<b>Defense Comments:</b> " + defsenseComments + "<br><br><b>Comments: </b>" + comments + '<br><br><b>Safety Comments: </b>' + safetyComments;
                }, 1000);
            }
        }, 1000);
    })
}

function getTeamNums() {
    const msg = parseInt(Math.random() * 6 + 1);
    if (msg == 1) {
        document.getElementById('rankingData').innerHTML = 'Stuck In Loop HELP...';
    } else if (msg == 2) {
        document.getElementById('rankingData').innerHTML = 'Good Things Are Worth Waiting For!';
    } else if (msg == 3) {
        document.getElementById('rankingData').innerHTML = 'I noticed your having a bad hair day!';
    } else if (msg == 4) {
        document.getElementById('rankingData').innerHTML = 'Working hard to get your data perfect!';
    } else if (msg == 6) {
        document.getElementById('rankingData').innerHTML = 'Please Wash your hands I am afraid of getting a virus';
    } else {
        document.getElementById('rankingData').innerHTML = 'Parsing..............';
    }
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
                        pikCells = pikCells / visability.length + newData;
                        delCells1 = delCells1 / visability.length;
                        delCells2 = delCells2 / visability.length;
                        delCells3 = delCells3 / visability.length;
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
                        pikCells = pikCells / visability.length + newData
                        delCells1 = delCells1 / visability.length;
                        delCells2 = delCells2 / visability.length;
                        delCells3 = delCells3 / visability.length;
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
                            document.getElementById('rankingData').innerHTML = `<span style="color: green">Average Stats for Team ${dataPos[0]}:</span><br><br>Metrics:<br> # of starting cells: <b>${dataPos[1]}</b> <br> # of Pickups: <b>${dataPos[2]}</b> <br> # of Delivers to Level 1: <b>${dataPos[3]}</b> <br> # of Delivers to Level 2: <b>${dataPos[4]}</b> <br> # of Delivers to Level 3: <b>${dataPos[5]}</b> <br> avg percent of climbs: <b>${dataPos[6]}%</b><br> avg percent of stage 2 (3-5): <b>${dataPos[10]}%</b><br> avg percent of landing on correct color: <b>${dataPos[11]}%</b> <br><br> Defense: <br> # of Pins<b> ${dataPos[7]}</b> <br> # of Pushes<b> ${dataPos[8]}</b> <br> # of Disables <b>${dataPos[9]}</b><br><br>This team received a score of <b>${countTeam1}</b> out of <b>${10 - discountedScore}</b>`;
                            document.getElementById('compare2').innerHTML = `<span style="color: red">Average Stats for Team ${teamNumbers[i]}:</span><br><br>Metrics:<br> # of starting cells: <b>${newData}</b> <br> # of Pickups: <b>${pikCells}</b> <br> # of Delivers to Level 1: <b>${delCells1}</b> <br> # of Delivers to Level 2: <b>${delCells2}</b> <br> # of Delivers to Level 3: <b>${delCells3}</b> <br> avg percent of climbs: <b>${climb}%</b><br> avg percent of stage 2 (3-5): <b>${stage2}%</b><br> avg percent of landing on correct color: <b>${stage3}% </b><br><br> Defense: <br> # of Pins <b>${pins}</b> <br> # of Pushes<b> ${push} <br> # of Disables<b> ${disabled}</b><br><br>This team received a score of<b> ${countTeam2}</b> out of <b>${10 - discountedScore}</b>`;
                            document.getElementById('compare3').innerHTML = `Scoring:<br><br>Between these two teams ${discountedScore} points were removed when scoring due to duplicate values<br><br>Team ${dataPos[0]} scored a ${countTeam1} VS Team ${teamNumbers[i]} who scored a ${countTeam2} out of ${10 - discountedScore}`;
                        } else if (countTeam1 == countTeam2) {
                            document.getElementById('rankingData').innerHTML = `<span style="color: green">Average Stats for Team ${dataPos[0]}:</span><br><br>Metrics:<br> # of starting cells: <b>${dataPos[1]}</b> <br> # of Pickups: <b>${dataPos[2]}</b> <br> # of Delivers to Level 1: <b>${dataPos[3]}</b> <br> # of Delivers to Level 2: <b>${dataPos[4]}</b> <br> # of Delivers to Level 3: <b>${dataPos[5]}</b> <br> avg percent of climbs: <b>${dataPos[6]}%</b><br> avg percent of stage 2 (3-5): <b>${dataPos[10]}%</b><br> avg percent of landing on correct color: <b>${dataPos[11]}%</b> <br><br> Defense: <br> # of Pins<b> ${dataPos[7]}</b> <br> # of Pushes<b> ${dataPos[8]}</b> <br> # of Disables <b>${dataPos[9]}</b><br><br>This team received a score of <b>${countTeam1}</b> out of <b>${10 - discountedScore}</b>`;
                            document.getElementById('compare2').innerHTML = `<span style="color: green">Average Stats for Team ${teamNumbers[i]}:</span><br><br>Metrics:<br> # of starting cells: <b>${newData}</b> <br> # of Pickups: <b>${pikCells}</b> <br> # of Delivers to Level 1: <b>${delCells1}</b> <br> # of Delivers to Level 2: <b>${delCells2}</b> <br> # of Delivers to Level 3: <b>${delCells3}</b> <br> avg percent of climbs: <b>${climb}%</b><br> avg percent of stage 2 (3-5): <b>${stage2}%</b><br> avg percent of landing on correct color: <b>${stage3}% </b><br><br> Defense: <br> # of Pins <b>${pins}</b> <br> # of Pushes<b> ${push} <br> # of Disables<b> ${disabled}</b><br><br>This team received a score of<b> ${countTeam2}</b> out of <b>${10 - discountedScore}</b>`;
                            document.getElementById('compare3').innerHTML = `Scoring:<br><br>Between these two teams ${discountedScore} points were removed when scoring due to duplicate values<br><br>Team ${dataPos[0]} scored a ${countTeam1} VS Team ${teamNumbers[i]} who scored a ${countTeam2} out of ${10 - discountedScore}`;
                        } else {
                            document.getElementById('rankingData').innerHTML = `<span style="color: red">Average Stats for Team ${dataPos[0]}:</span><br><br>Metrics:<br> # of starting cells: <b>${dataPos[1]}</b> <br> # of Pickups: <b>${dataPos[2]}</b> <br> # of Delivers to Level 1: <b>${dataPos[3]}</b> <br> # of Delivers to Level 2: <b>${dataPos[4]}</b> <br> # of Delivers to Level 3: <b>${dataPos[5]}</b> <br> avg percent of climbs: <b>${dataPos[6]}%</b><br> avg percent of stage 2 (3-5): <b>${dataPos[10]}%</b><br> avg percent of landing on correct color:<b> ${dataPos[11]}%</b> <br><br> Defense: <br> # of Pins <b>${dataPos[7]}</b> <br> # of Pushes<b> ${dataPos[8]}</b> <br> # of Disables <b>${dataPos[9]}</b><br><br>This team received a score of <b>${countTeam1}</b> out of <b>${10 - discountedScore}</b>`;
                            document.getElementById('compare2').innerHTML = `<span style="color: green">Average Stats for Team ${teamNumbers[i]}:</span><br><br>Metrics:<br> # of starting cells: <b>${newData} <br> # of Pickups: <b>${pikCells}</b> <br> # of Delivers to Level 1: <b>${delCells1}</b> <br> # of Delivers to Level 2: <b>${delCells2}</b> <br> # of Delivers to Level 3: <b>${delCells3}</b> <br> avg percent of climbs: <b>${climb}%</b><br> avg percent of stage 2 (3-5): <b>${stage2}%</b><br> avg percent of landing on correct color:<b> ${stage3}% </b><br><br> Defense: <br> # of Pins <b>${pins}</b> <br> # of Pushes <b>${push}</b> <br> # of Disables <b>${disabled}</b><br><br>This team received a score of <b>${countTeam2}</b> out of <b>${10 - discountedScore}</b>`;
                            document.getElementById('compare3').innerHTML = `Scoring:<br><br>Between these two teams ${discountedScore} points were removed when scoring due to duplicate values<br><br>Team ${dataPos[0]} scored a ${countTeam1} VS Team ${teamNumbers[i]} who scored a ${countTeam2} out of ${10 - discountedScore}`;
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
            document.getElementById('rankingData').innerHTML = `<span style="font-size: 24px;">Average Pick Ups: <span style="color: yellow;">${Math.ceil(pikCellsParse * 1000) / 1000}</span><br>Average Delivers to Level 1: <span style="color: yellow;">${Math.ceil(delCells1Parse * 1000) / 1000}</span><br>Average Delivers to Level 2: <span style="color: yellow;">${Math.ceil(delCells2Parse * 1000) / 1000}</span><br>Average Delivers to Level 3: <span style="color: yellow;">${Math.ceil(delCells3Parse * 1000) / 1000}</span><br>Average Stage 2 Spin (3-5): <span style="color: yellow;">${Math.ceil(stage2 * 1000) / 1000}%</span><br>Average Lands on Correct Color: <span style="color: yellow">${Math.ceil(stage3 * 1000) / 1000}%</span><br>Average Climb: <span style="color: yellow;">${Math.ceil(climb * 1000) / 1000}%</span><br>Average Pins: <span style="color: rgb(3, 223, 252);">${Math.ceil(pinsParse * 1000) / 1000}</span><br>Average Push: <span style="color: rgb(3, 223, 252);">${Math.ceil(pushParse * 1000) / 1000}</span><br>Average Disables: <span style="color: rgb(3, 223, 252);">${Math.ceil(disabledParse * 1000) / 1000}</span></span>`;
            document.getElementById('loading2').style.display = "none";
        }, 900);
    })
}