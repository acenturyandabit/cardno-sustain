const express = require('express');
const fs = require('fs')
const PORT = process.env.PORT || 5000;
const fileupload = require('express-fileupload');
const pdf = require('pdf-parse');
try {
    fs.mkdirSync(__dirname + "/tmp");
} catch (e) {
    //ok alr exist nw
}
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(fileupload());
app.post('/upload', (req, res) => {
    const fileName = Date.now() + req.files.myFile.name;
    console.log(req.files.myFile);
    const lfname = __dirname + '/tmp/' + fileName;
    req.files.myFile.mv(lfname).then(() => {
        console.log("yeet");
        let dataBuffer = fs.readFileSync(lfname);pdf(dataBuffer).then(function (data) {
            console.log("yote");
            res.send(data.text);
            res.end();
        });
    });
})

app.listen(PORT);