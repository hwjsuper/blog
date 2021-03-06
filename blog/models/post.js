var conn = require('./db');
var markdown = require('markdown').markdown;

function Post(name, title, tags, post) {
	this.name = name;
	this.title = title;
	this.tags = tags;
	this.post = post;
}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
	var date = new Date();
	//存储各种时间格式，方便以后扩展
	var time = {
		date: date,
		year: date.getFullYear(),
		month: date.getFullYear() + "-" + (date.getMonth() + 1),
		day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
		minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "-" +
			date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	}
	//要存入数据库的文档
	var post = {
		name: this.name,
		time: time,
		title: this.title,
		tags: this.tags,
		post: this.post
	};
	// conn.connect();
	var sql = "INSERT INTO Posts (name,time,title,tags,post) VALUES ('"+post.name+"','"+post.time.minute+"', '"+post.title+"', '"+post.tags+"', '"+post.post+"');"
	conn.query(sql, function(err, rows) {
		if (err) {
			throw err;
			return callback(err);
		}
		callback(null);
	});
	// conn.end();
	/*
	//打开数据库
	mongodb.open(function (err, db) {
	  if (err) {
	    return callback(err);
	  }
	  //读取 posts 集合
	  db.collection('posts', function (err, collection) {
	    if (err) {
	      mongodb.close();
	      return callback(err);
	    }
	    //将文档插入 posts 集合
	    collection.insert(post, {
	      safe: true
	    }, function (err) {
	      mongodb.close();
	      if (err) {
	        return callback(err);//失败！返回 err
	      }
	      callback(null);//返回 err 为 null
	    });
	  });
	});*/
};

//读取文章及其相关信息
Post.get = function(name, callback) {
	// conn.connect();
	var sql ;
	if(name == null){
		sql = "SELECT * FROM Posts ORDER BY time DESC ;";
	}
	else {
		sql = "SELECT * FROM Posts WHERE name = '"+name+"' ORDER BY time DESC ;";
	}
	conn.query(sql, function(err, rows) {
		if (err) {
			throw err;
			return callback(err);
		} else {
			 rows.forEach(function (doc) {
			       doc.post = markdown.toHTML(doc.post);//解析 markdown 为 html
			       doc.tags = doc.tags.split(",");
			});
			callback(null, rows);//以数组形式返回查询的结果
		}
	});
	// conn.end();
	// //打开数据库
	// mongodb.open(function (err, db) {
	//   if (err) {
	//     return callback(err);
	//   }
	//   //读取 posts 集合
	//   db.collection('posts', function(err, collection) {
	//     if (err) {
	//       mongodb.close();
	//       return callback(err);
	//     }
	//     var query = {};
	//     if (name) {
	//       query.name = name;
	//     }
	//     //根据 query 对象查询文章
	//     collection.find(query).sort({
	//       time: -1
	//     }).toArray(function (err, docs) {
	//       mongodb.close();
	//       if (err) {
	//         return callback(err);//失败！返回 err
	//       }
	//       //解析 markdown 为 html
	//        docs.forEach(function (doc) {
	//         doc.post = markdown.toHTML(doc.post);
	//       });
	//       callback(null, docs);//成功！以数组形式返回查询的结果
	//     });
	//   });
	// });
};

Post.getOne = function(name, time, title, callback) {
	var sql ="SELECT * FROM Posts WHERE name = '"+name+"' AND time = '"+time+"' AND title = '"+title+"';";
	conn.query(sql, function(err, rows) {
		if (err) {
			throw err;
			return callback(err);
		} 
		else if (rows.length != 0) {
			rows[0].post = markdown.toHTML(rows[0].post);//解析 markdown 为 html
			rows[0].tags = rows[0].tags.split(",");
			callback(null, rows[0]);//返回查询的一篇文章
		}
		else {
			callback(null);
		}
	});
  // //打开数据库
  // mongodb.open(function (err, db) {
  //   if (err) {
  //     return callback(err);
  //   }
  //   //读取 posts 集合
  //   db.collection('posts', function (err, collection) {
  //     if (err) {
  //       mongodb.close();
  //       return callback(err);
  //     }
  //     //根据用户名、发表日期及文章名进行查询
  //     collection.findOne({
  //       "name": name,
  //       "time.day": day,
  //       "title": title
  //     }, function (err, doc) {
  //       mongodb.close();
  //       if (err) {
  //         return callback(err);
  //       }
  //       //解析 markdown 为 html
  //       doc.post = markdown.toHTML(doc.post);
  //       callback(null, doc);//返回查询的一篇文章
  //     });
  //   });
  // });
};

//返回原始发表的内容（markdown 格式）
Post.edit = function(name, time, title, callback) {
	var sql ="SELECT * FROM Posts WHERE name = '"+name+"' AND time = '"+time+"' AND title = '"+title+"';";
	conn.query(sql, function(err, rows) {
		if (err) {
			throw err;
			return callback(err);
		} else {
			rows[0].tags = rows[0].tags.split(",");
			callback(null, rows[0]);//返回查询的一篇文章
		}
	});
  // //打开数据库
  // mongodb.open(function (err, db) {
  //   if (err) {
  //     return callback(err);
  //   }
  //   //读取 posts 集合
  //   db.collection('posts', function (err, collection) {
  //     if (err) {
  //       mongodb.close();
  //       return callback(err);
  //     }
  //     //根据用户名、发表日期及文章名进行查询
  //     collection.findOne({
  //       "name": name,
  //       "time.day": day,
  //       "title": title
  //     }, function (err, doc) {
  //       mongodb.close();
  //       if (err) {
  //         return callback(err);
  //       }
  //       callback(null, doc);//返回查询的一篇文章（markdown 格式）
  //     });
  //   });
  // });
};

//更新一篇文章及其相关信息
Post.update = function(name, time, title, tags, post, callback) {
	var sql = "UPDATE Posts SET title = '"+title+"', tags = '"+tags+"', post = '"+post+"' WHERE name = '"+name+"' AND time = '"+time+"';";
	conn.query(sql, function(err, rows) {
		if (err) {
			throw err;
			return callback(err);
		}
		callback(null);
	});
  // //打开数据库
  // mongodb.open(function (err, db) {
  //   if (err) {
  //     return callback(err);
  //   }
  //   //读取 posts 集合
  //   db.collection('posts', function (err, collection) {
  //     if (err) {
  //       mongodb.close();
  //       return callback(err);
  //     }
  //     //更新文章内容
  //     collection.update({
  //       "name": name,
  //       "time.day": day,
  //       "title": title
  //     }, {
  //       $set: {post: post}
  //     }, function (err) {
  //       mongodb.close();
  //       if (err) {
  //         return callback(err);
  //       }
  //       callback(null);
  //     });
  //   });
  // });
};

//删除一篇文章
Post.remove = function(name, time, title, callback) {
	var sql = "DELETE FROM Posts WHERE name = '"+name+"' AND time = '"+time+"' AND title = '"+title+"';";
	conn.query(sql, function(err, rows) {
		if (err) {
			throw err;
			return callback(err);
		}
		callback(null);
	});
  //打开数据库
  // mongodb.open(function (err, db) {
  //   if (err) {
  //     return callback(err);
  //   }
  //   //读取 posts 集合
  //   db.collection('posts', function (err, collection) {
  //     if (err) {
  //       mongodb.close();
  //       return callback(err);
  //     }
  //     //根据用户名、日期和标题查找并删除一篇文章
  //     collection.remove({
  //       "name": name,
  //       "time.day": day,
  //       "title": title
  //     }, {
  //       w: 1
  //     }, function (err) {
  //       mongodb.close();
  //       if (err) {
  //         return callback(err);
  //       }
  //       callback(null);
  //     });
  //   });
  // });
};

//返回所有标签
Post.getTags = function(callback) {
	var sql ="SELECT DISTINCT tags FROM Posts;";
	var tags = new Array();
	conn.query(sql, function(err, rows) {
		if (err) {
			throw err;
			return callback(err);
		} 
		else if (rows.length != 0) {
			for (var i  in rows){
				tags = tags.concat(rows[i].tags.split(","));
			}
			callback(null, tags);
		}
		else {
			callback(null);
		}
	});
  // mongodb.open(function (err, db) {
  //   if (err) {
  //     return callback(err);
  //   }
  //   db.collection('posts', function (err, collection) {
  //     if (err) {
  //       mongodb.close();
  //       return callback(err);
  //     }
  //     //distinct 用来找出给定键的所有不同值
  //     collection.distinct("tags", function (err, docs) {
  //       mongodb.close();
  //       if (err) {
  //         return callback(err);
  //       }
  //       callback(null, docs);
  //     });
  //   });
  // });
};

//返回含有特定标签的所有文章
Post.getTag = function(tag, callback) {
	var self = this;
	var sql ="SELECT * FROM Posts WHERE tags like '%"+tag+"%';";
	conn.query(sql, function(err, rows) {
		if (err) {
			throw err;
			return callback(err);
		} 
		else if (rows.length != 0) {
			rows.forEach(function(row){
				row.time = self.formatTime(row.time);
			});
			callback(null, rows);
		}
		else {
			callback(null);
		}
	});
  // mongodb.open(function (err, db) {
  //   if (err) {
  //     return callback(err);
  //   }
  //   db.collection('posts', function (err, collection) {
  //     if (err) {
  //       mongodb.close();
  //       return callback(err);
  //     }
  //     //查询所有 tags 数组内包含 tag 的文档
  //     //并返回只含有 name、time、title 组成的数组
  //     collection.find({
  //       "tags": tag
  //     }, {
  //       "name": 1,
  //       "time": 1,
  //       "title": 1
  //     }).sort({
  //       time: -1
  //     }).toArray(function (err, docs) {
  //       mongodb.close();
  //       if (err) {
  //         return callback(err);
  //       }
  //       callback(null, docs);
  //     });
  //   });
  // });
};

Post.formatTime = function(time){
	var tmp = time.split("-");
	var year = tmp[0];
	var month = tmp[0]+"-"+tmp[1];
	var day = tmp[0]+"-"+tmp[1]+"-"+tmp[2];
	var minute = tmp[0]+"-"+tmp[1]+"-"+tmp[2]+"-"+tmp[3];
	var newTime = {
		year: year,
		month: month,
		day: day,
		minute: minute
	}
	return newTime;
}