var conn = require('./db');
//var markdown = require('markdown').markdown;

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
    var year = date.getFullYear();
    var month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    var time = {
            date: date,
            year: year,
            month: year + "-" + month,
            day: year + "-" + month + "-" + day,
            minute: year + "-" + month + "-" + day + " " + hours + ":" + minutes
        }
        //要存入数据库的文档
    var post = {
        name: this.name,
        time: time,
        title: this.title,
        tags: this.tags,
        pv: 0,
        post: this.post
    };
    // conn.connect();
    var sql = "INSERT INTO blog_Posts (name,time,title,tags,pv,post) VALUES ('" + post.name + "','" + post.time.minute + "', '" + post.title + "', '" + post.tags + "', " + post.pv + ", '" + post.post + "');"
    conn.query(sql, function(err, rows) {
        if (err) {
            throw err;
            return callback(err);
        }
        callback(null);
    });
    // conn.end();
};

//读取文章及其相关信息
Post.getTen = function(name, page, callback) {
    var sql;
    var maxId = 0,
        maxNum = 0;
    if (name == null) {
        conn.query("SELECT COUNT(*) AS NUM, MAX(id) AS MAX FROM blog_Posts", function(err, result) {
            if (err) {
                throw err;
                return callback(err);
            }
            maxId = result[0].MAX;
            maxNum = result[0].NUM;
            if (maxNum == null) maxNum = 0;
            var maxid = parseInt(maxId - (page - 1) * 10);
            var minid = parseInt(maxId - page * 10);
            sql = "SELECT * FROM blog_Posts WHERE id <= " + maxid + "  AND id >" + minid + " ORDER BY id DESC;";
            //sql = "SELECT *,left(post,300) AS limitPost FROM blog_Posts WHERE id <= "+maxid+"  AND id >"+minid+" ORDER BY id DESC;";
            conn.query(sql, function(err, rows) {
                if (err) {
                    throw err;
                    return callback(err);
                } else {
                    rows.forEach(function(doc) {
                        //doc.post = doc.limitPost;
                        //doc.post = markdown.toHTML(doc.limitPost);//解析 markdown 为 html
                        doc.tags = doc.tags.replace(/[ ]/g, "").split(",");
                    });
                    callback(null, rows, maxNum); //以数组形式返回查询的结果
                }
            });
        });
    } else {
        conn.query("SELECT COUNT(*) AS NUM, MAX(id) AS max FROM blog_Posts WHERE name = '" + name + "' ", function(err, result) {
            if (err) {
                throw err;
                return callback(err);
            }
            maxId = result[0].max;
            maxNum = result[0].NUM;
            if (maxNum == null) maxNum = 0;
            var maxid = parseInt(maxId - (page - 1) * 10);
            var minid = parseInt(maxId - page * 10);
            sql = "SELECT * FROM blog_Posts WHERE name = '" + name + "' AND id <= " + maxid + " AND id >" + minid + " ORDER BY id DESC;";
            //sql = "SELECT *,left(post,300) AS limitPost FROM blog_Posts WHERE name = '"+name+"' AND id <= "+maxid+" AND id >"+minid+" ORDER BY id DESC;";
            conn.query(sql, function(err, rows) {
                if (err) {
                    throw err;
                    return callback(err);
                } else {
                    rows.forEach(function(doc) {
                        //doc.post = doc.limitPost;
                        //doc.post = markdown.toHTML(doc.limitPost);//解析 markdown 为 html
                        doc.tags = doc.tags.replace(/[ ]/g, "").split(",");
                    });
                    callback(null, rows, maxNum); //以数组形式返回查询的结果
                }
            });
        });
    }
};

Post.getOne = function(name, time, title, callback) {
    var sql = "SELECT * FROM blog_Posts WHERE name = '" + name + "' AND time = '" + time + "' AND title = '" + title + "';";
    conn.query(sql, function(err, rows) {
        if (err) {
            throw err;
            return callback(err);
        } else if (rows.length != 0) {
            //rows[0].post = markdown.toHTML(rows[0].post);//解析 markdown 为 html
            rows[0].tags = rows[0].tags.split(",");
            rows[0].pv = rows[0].pv + 1;
            var sql = "UPDATE blog_Posts SET pv = pv+1 WHERE name = '" + name + "' AND time = '" + time + "' AND title = '" + title + "';"
            conn.query(sql, function(err) {
                if (err) {
                    throw err;
                    return callback(err);
                }
            });
            callback(null, rows[0]); //返回查询的一篇文章
        } else {
            callback(null);
        }
    });
};
Post.getOneId = function(name, time, title, callback) {
    var sql = "SELECT id FROM blog_Posts WHERE name = '" + name + "' AND time = '" + time + "' AND title = '" + title + "';";
    conn.query(sql, function(err, rows) {
        if (err) {
            throw err;
            return callback(err);
        } else if (rows.length != 0) {
            console.log(rows[0].id);
            callback(null, rows[0].id);
        } else {
            callback(null);
        }
    });
};
//返回所有文章归档信息
Post.getArchive = function(callback) {
    var self = this;
    sql = "SELECT name,time,title FROM blog_Posts ORDER BY id DESC;";
    conn.query(sql, function(err, rows) {
        if (err) {
            throw err;
            return callback(err);
        } else {
            rows.forEach(function(row) {
                row.time = self.formatTime(row.time);
            });
            callback(null, rows); //以数组形式返回查询的结果
        }
    });
};

//返回原始发表的内容（markdown 格式）
Post.edit = function(name, time, title, callback) {
    var sql = "SELECT * FROM blog_Posts WHERE name = '" + name + "' AND time = '" + time + "' AND title = '" + title + "';";
    conn.query(sql, function(err, rows) {
        if (err) {
            throw err;
            return callback(err);
        } else {
            rows[0].tags = rows[0].tags.split(",");
            callback(null, rows[0]); //返回查询的一篇文章
        }
    });
};

//更新一篇文章及其相关信息
Post.update = function(name, time, title, tags, post, callback) {
    var sql = "UPDATE blog_Posts SET title = '" + title + "', tags = '" + tags + "', post = '" + post + "' WHERE name = '" + name + "' AND time = '" + time + "';";
    conn.query(sql, function(err, rows) {
        if (err) {
            throw err;
            return callback(err);
        }
        callback(null);
    });
};

//删除一篇文章
Post.remove = function(name, time, title, callback) {
    var sql = "DELETE FROM blog_Posts WHERE name = '" + name + "' AND time = '" + time + "' AND title = '" + title + "';";
    conn.query(sql, function(err, rows) {
        if (err) {
            throw err;
            return callback(err);
        }
        callback(null);
    });
};

//返回所有标签 unique
Post.getTags = function(callback) {
    var sql = "SELECT DISTINCT tags FROM blog_Posts;";
    var tags = new Array();
    conn.query(sql, function(err, rows) {
        if (err) {
            throw err;
            return callback(err);
        } else if (rows.length != 0) {
            for (var i in rows) {
                tags = tags.concat(rows[i].tags.replace(/[ ]/g, "").split(",")); //remove space
            }
            var arr = [];
            for (var i = 0, len = tags.length; i < len; i++) {
                !RegExp(tags[i], "g").test(arr.join(",")) && (arr.push(tags[i])); //remove repeatitive tags
            }
            callback(null, arr);
        } else {
            callback(null);
        }
    });
};

//返回含有特定标签的所有文章
Post.getTag = function(tag, callback) {
    var self = this;
    var sql = "SELECT * FROM blog_Posts WHERE tags like '%" + tag + "%' ORDER BY id DESC;";
    conn.query(sql, function(err, rows) {
        if (err) {
            throw err;
            return callback(err);
        } else if (rows.length != 0) {
            rows.forEach(function(row) {
                row.time = self.formatTime(row.time);
            });
            callback(null, rows);
        } else {
            callback(null);
        }
    });
};

Post.formatTime = function(time) {
    var tmp = time.replace(/ /, "-").split("-");
    var year = tmp[0];
    var month = tmp[0] + "-" + tmp[1];
    var day = tmp[0] + "-" + tmp[1] + "-" + tmp[2];
    var minute = tmp[0] + "-" + tmp[1] + "-" + tmp[2] + " " + tmp[3];
    var newTime = {
        year: year,
        month: month,
        day: day,
        minute: minute
    }
    return newTime;
}

//返回通过标题关键字查询的所有文章信息
Post.search = function(keyword, callback) {
    var self = this;
    var sql = "SELECT * FROM blog_Posts WHERE title like '%" + keyword + "%' ORDER BY id DESC;";
    conn.query(sql, function(err, rows) {
        if (err) {
            throw err;
            return callback(err);
        }
        rows.forEach(function(row) {
            row.time = self.formatTime(row.time);
        });
        callback(null, rows);
    });
};
