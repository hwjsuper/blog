 // var settings = require('../settings'),
 //        Db = require('mongodb').Db,
 //        Connection = require('mongodb').Connection,
 //        Server = require('mongodb').Server;
 //    module.exports = new Db(settings.db, new Server(settings.host, settings.port),
 // {safe: true});


 // var mysql = require('mysql');
 // var conn = mysql.createConnection({
 //     host: 'localhost',
 //     user: 'root',
 //     password: 'clannad',
 //     database: 'blog',
 //     port: 3306
 // });
 // module.exports = conn;

var Client = require('easymysql');
var mysql = Client.create({
  'maxconnections' : 10
});

mysql.addserver({
  'host' : '127.0.0.1',
  'user' : 'root',
  'password' : 'clannad',
  'database': 'blog',
  'port': 3306
});

mysql.on('busy', function (queuesize, maxconnections, which) {
  // XXX: write log and monitor it
});

// mysql.query('SHOW DATABASES', function (error, res) {
//   console.log(res);
// });

// bind params
// mysql.query({
//   sql: 'select * from users where user =: user',
//   params: {user: 'user'}
// }, function (err, rows) {
//   console.log(rows);
// });

module.exports = mysql;

 // var sql1 = 'CREATE TABLE Users (
 // id int(10)  PRIMARY KEY NOT NULL AUTO_INCREMENT,
 // name varchar(20) NOT NULL,
 // password varchar(50) NOT NULL,
 // email varchar(50) 
 // );';

 //  var sql2 = 'CREATE TABLE Posts (
 // id int(10) PRIMARY KEY NOT NULL AUTO_INCREMENT,
 // name varchar(20) NOT NULL,
 // time varchar(40) NOT NULL,
 // title varchar(100) NOT NULL,
 // tags varchar(100) NOT NULL,
 // post varchar(1000) NOT NULL
 // );';

 //  var sql3 = 'CREATE TABLE Comments (
 // A_id int(10) NOT NULL,
 // name varchar(20) NOT NULL,
 // time varchar(40) NOT NULL,
 // post varchar(1000) NOT NULL
 // );';