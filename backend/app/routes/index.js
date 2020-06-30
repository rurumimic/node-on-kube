const os = require('os');
const express = require('express');
const router = express.Router();

let ipv4 = [];

for (let interface of Object.values(os.networkInterfaces())) {
  for (let ip of interface) {
    if (ip['family'] == 'IPv4') {
      ipv4.push(ip['address'])
    }
  }
}

function bytesToSize(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

const host = [os.hostname(), os.type(), os.platform(), os.arch(), 
              os.release(), bytesToSize(os.totalmem()), bytesToSize(os.freemem()), ipv4];

router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Backend App',
    host: host
  });
});

module.exports = router;
