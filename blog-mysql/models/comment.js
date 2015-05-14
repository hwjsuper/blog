var conn = require('./db');
var markdown = require('markdown').markdown;

function Comment(A_id, name, time, post) {
  this.A_id = A_id;
  this.name = name;
  this.time = time;
  this.post = post;
}

module.exports = Comment;

//存储一条留言信息
Comment.prototype.save = function(callback) {
  var id = this.A_id, 
    name = this.name,
    time = this.time,
    post = this.post;
    console.log(id,name,time,post);
  var sql = "INSERT INTO Comments (A_id,name,time,post) VALUES ('" + id + "', '" + name + "','" + time + "', '" + post + "');"
  conn.query(sql, function(err, rows) {
    if (err) {
      throw err;
      return callback(err);
    }
    callback(null);
  });
};
//get留言信息
Comment.get = function(id, callback) {
  var sql ="SELECT * FROM Comments WHERE A_id = '"+id+"' ORDER BY time DESC;";
  conn.query(sql, function(err, rows) {
    if (err) {
      throw err;
      return callback(err);
    } 
    else if (rows.length != 0) {
      rows.forEach(function (doc) {
            doc.post = markdown.toHTML(doc.post);
      });
      callback(null, rows);
    }
    else {
      callback(null);
    }
  });
}