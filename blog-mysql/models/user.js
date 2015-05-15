var conn = require('./db');
var crypto = require('crypto');

function User(user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
	//要存入数据库的用户文档
	var user = {
		name: this.name,
		password: this.password,
		email: this.email
	};
	var sql = "INSERT INTO Users (name,password,email) VALUES('"+user.name+"', '"+user.password+"', '"+user.email+"');"
	conn.query(sql, function(err, rows) {
		if (err) {
			throw err;
			return callback(err);
		}
		callback(null, user);
	});
};

//读取用户信息
User.get = function(name, callback) {
	// conn.connect();
	var sql = "SELECT * FROM Users WHERE name = '" + name + "';"
	conn.query(sql, function(err, rows) {
		if (err) {
			throw err;
			return callback(err);
		} else if (rows.length != 0) { //rows is not empty
			callback(null, rows[0]);
		} else {
			callback(null);
		}
	});
};