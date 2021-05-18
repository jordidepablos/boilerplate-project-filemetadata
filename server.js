require('dotenv').config()
const fs = require('fs');
const http = require('http');
const https = require('https');
const privateKey = fs.existsSync('certs/privkey.pem')
  ? fs.readFileSync('certs/privkey.pem', 'utf8')
  : undefined;
const certificate = fs.existsSync('certs/cert.pem')
  ? fs.readFileSync('certs/cert.pem', 'utf8')
  : undefined;
const credentials = privateKey !== undefined && certificate !== undefined
  ? { key: privateKey, cert: certificate }
  : undefined;
const cors = require('cors');
const express = require('express');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});


// API
app.post('/api/fileanalyse', upload.single('upfile'), (req, res, next) => {
  // console.log(req.file);
  fs.unlink(req.file.path, (err)=>{
    if (err) console.log(err);
  });
  res.json({
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  });
});


//Error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.json({ error: err.message });
});

// Listen for requests
let apiServer;
if (credentials)
  apiServer = https.createServer(credentials, app);
else
  apiServer = http.createServer(app);

apiServer.listen(port, function () {
  console.log('Your app is listening on port ' + apiServer.address().port);
});
