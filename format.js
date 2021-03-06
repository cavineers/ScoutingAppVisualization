const fs = require('fs');
const fse = require('fs-extra');

const dbFolder = './db/';
const dbFolderFiles = '/db/';
const dbfiles = [];



/*
OPEN COMMAND PROMPT AND TYPE (AFTER CD INTO db folder) copy *.txt processed.json
THIS COMMAND CONCATS Files and prints json file
*/

fs.readdir(dbFolder, (err, files) => {
        if (err) throw (err)
        files.forEach(file => {
            fs.readFile(__dirname + dbFolderFiles + file, 'utf8', (err, data) => {
                if (err) throw err;
                dbfiles.push(file);
                console.log(file);
                fs.writeFile(`${file}.json`, data + '\n{"remove": 1}', function(err) {
                    if (err) throw (err);
                })
            })
        })
    })
    //Copies files in db folder to my E:\ drive
var sourceDir = __dirname + '/db';
var destDir = "D:\data(server)";

/* if folder doesn't exists create it
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
} */

if (!fs.existsSync(destDir)) {
    console.log('Directory Not Found (Plug in Drive)')
} else {
    //copy directory content including subfolders
    fse.copy(sourceDir, destDir, function(err) {
        if (err) {
            console.error(err);
        } else {
            console.log("success!");
        }
    });
}
setTimeout(function() {
    for (let i = 0; i < dbfiles.length; i++) {
        fs.unlinkSync(__dirname + dbFolderFiles + dbfiles[i]); //Deletes Files After being processed
    }
}, 600);