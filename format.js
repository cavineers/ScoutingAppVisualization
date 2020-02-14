const fs = require('fs');
const fse = require('fs-extra');

const dbFolder = './db/';
const dbFolderFiles = '/db/';
const dbfiles = [];

fs.readdir(dbFolder, (err, files) => {
        if (err) throw (err)
        console.log(files);
        files.forEach(file => {
            fs.readFile(__dirname + dbFolderFiles + file, 'utf8', (err, data) => {
                if (err) throw err;
                console.log(file)
                dbfiles.push(file);
                fs.writeFile(`${file}.json`, data + '\n{"remove": 1}', function(err) {
                    if (err) throw (err);
                })
            })
        })
    })
    //Copies files in db folder to my E:\ drive
var sourceDir = __dirname + '/db';
var destDir = "E:\data(server)";

// if folder doesn't exists create it
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

//copy directory content including subfolders
fse.copy(sourceDir, destDir, function(err) {
    if (err) {
        console.error(err);
    } else {
        console.log("success!");
    }
});
setTimeout(function() {
    for (let i = 0; i < dbfiles.length; i++) {
        fs.unlinkSync(__dirname + dbFolderFiles + dbfiles[i]); //Deletes Files After being processed
    }
}, 600);