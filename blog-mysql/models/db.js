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

module.exports = mysql;

/* commends for mysql
CREATE DATABASE blog CHARACTER SET 'utf8' COLLATE 'utf8_general_ci';

use blog

CREATE TABLE blog_Users (
 id int(10)  PRIMARY KEY NOT NULL AUTO_INCREMENT,
 name varchar(20) NOT NULL,
 password varchar(50) NOT NULL,
 email varchar(50) 
 )ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE blog_Posts (
 id int(10) PRIMARY KEY NOT NULL AUTO_INCREMENT,
 name varchar(20) NOT NULL,
 time varchar(40) NOT NULL,
 title varchar(100) NOT NULL,
 tags varchar(100) NOT NULL,
 pv int(10) NOT NULL,
 post text NOT NULL
 )ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE blog_Comments (
 id int(10) PRIMARY KEY NOT NULL AUTO_INCREMENT,
 A_id int(10) NOT NULL,
 name varchar(20) NOT NULL,
 email varchar(50) ,
 time varchar(40) NOT NULL,
 post text NOT NULL
 )ENGINE=InnoDB DEFAULT CHARSET=utf8;
 */