var crypto = require('crypto'),
	User = require('../models/user.js'),
	Post = require('../models/post.js');
	Comment = require('../models/comment.js');

var express = require('express');
var app = express.Router();

app.get('/', function(req, res) {
  res.render('index');
});
// app.get('/about', function(req, res) {
//   res.render('about');
// });
// app.get('/portfolio', function(req, res) {
//   res.render('portfolio');
// });

app.get('/blog', function(req, res) {
	//判断是否是第一页，并把请求的页数转换成 number 类型
	var page = req.query.p ? parseInt(req.query.p) : 1;
	//查询并返回第 page 页的 10 篇文章
	Post.getTen(null, page, function(err, posts, total) {
		if (err) {
			posts = [];
		}
		res.render('outline', {
			title: '主页',
			posts: posts,
			page: page,
			isFirstPage: (page - 1) == 0,
			isLastPage: ((page - 1) * 10 + posts.length) == total,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

app.get('/reg', checkNotLogin);
app.get('/reg', function(req, res) {
	res.render('reg', {
		title: '注册',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

app.post('/reg', checkNotLogin);
app.post('/reg', function(req, res) {
	var name = req.body.name,
		password = req.body.password,
		password_re = req.body['password-repeat'];
	if (password_re != password) {
		req.flash('error', '两次输入的密码不一致!');
		return res.redirect('/reg');
	}
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex');
	var newUser = new User({
		name: name,
		password: password,
		email: req.body.email
	});
	User.get(newUser.name, function(err, user) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/blog');
		}
		if (user) {
			req.flash('error', '用户已存在!');
			return res.redirect('/reg');
		}
		newUser.save(function(err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			req.session.user = user;
			req.flash('success', '注册成功!');
			res.redirect('/blog');
		});
	});
});

app.get('/login', checkNotLogin);
app.get('/login', function(req, res) {
	res.render('login', {
		title: '登录',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

app.post('/login', checkNotLogin);
app.post('/login', function(req, res) {
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex');
	User.get(req.body.name, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在!');
			return res.redirect('/login');
		}
		if (user.password != password) {
			req.flash('error', '密码错误!');
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success', '登陆成功!');
		res.redirect('/blog');
	});
});

app.get('/post', checkLogin);
app.get('/post', function(req, res) {
	res.render('post', {
		title: '发表',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

app.post('/post', checkLogin);
app.post('/post', function(req, res) {
	var currentUser = req.session.user,
		tags = req.body.tags,
		post = new Post(currentUser.name, req.body.title, tags, req.body.post);
	if (req.body.title == '' || req.body.post == '') {
		req.flash('error', '内容不能为空!');
		return res.redirect('/post');
	} else {
		post.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/blog');
			}
			req.flash('success', '发布成功!');
			res.redirect('blog'); //发表成功跳转到主页
		});
	}
});

app.get('/logout', checkLogin);
app.get('/logout', function(req, res) {
	req.session.user = null;
	req.flash('success', '登出成功!');
	res.redirect('/blog');
});

app.get('/upload', checkLogin);
app.get('/upload', function(req, res) {
	res.render('upload', {
		title: '文件上传',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

app.post('/upload', checkLogin);
app.post('/upload', function(req, res) {
	req.flash('success', '文件上传成功!');
	res.redirect('/upload');
});

app.get('/archive', function (req, res) {
  Post.getArchive(function (err, posts) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/blog');
    }
    res.render('archive', {
      title: '归档',
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

app.get('/search', function (req, res) {
  Post.search(req.query.keyword, function (err, posts) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/blog');
    }
    res.render('archive', {
      title: "SEARCH:" + req.query.keyword,
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

app.get('/u/:name', function(req, res) {
	//检查用户是否存在
	User.get(req.params.name, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在!');
			return res.redirect('/blog'); //用户不存在则跳转到主页
		}
		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;
		//查询并返回第 page 页的 10 篇文章
		Post.getTen(user.name, page, function(err, posts,total) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/blog');
			}
			console.log(total);
			res.render('outline', {
				title: user.name,
				posts: posts,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + posts.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
});

app.get('/u/:name/:time/:title', function(req, res) {
	Post.getOne(req.params.name, req.params.time, req.params.title, function(err, post) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/blog');
		}
		Comment.get(post.id, function(err, comments) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/blog');
			}
			res.render('article', {
				title: req.params.title,
				post: post,
				comments: comments,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
});

app.post('/u/:name/:time/:title', function(req, res) {
	var date = new Date();
	var time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
		date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
	var name = req.body.name;
	var email =  req.body.email;
	var content = req.body.content;
	if(name == '' || content  == ''){
		req.flash('error', '内容不能为空!');
		res.redirect('back');
	}
	else {
		Post.getOneId(req.params.name, req.params.time, req.params.title, function(err, id) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/blog');
			} else {
				var newComment = new Comment(id, name, email, time, content);
				newComment.save(function(err) {
					if (err) {
						req.flash('error', err);
						return res.redirect('back');
					}
					req.flash('success', '留言成功!');
					res.redirect('back');
				});
			}
		});
	}
});

app.get('/edit/:name/:time/:title', checkLogin);
app.get('/edit/:name/:time/:title', function(req, res) {
	var currentUser = req.session.user;
	Post.edit(currentUser.name, req.params.time, req.params.title, function(err, post) {
		if (err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		res.render('edit', {
			title: '编辑',
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

app.post('/edit/:name/:time/:title', checkLogin);
app.post('/edit/:name/:time/:title', function(req, res) {
	var currentUser = req.session.user;
	Post.update(currentUser.name, req.params.time, req.body.title, req.body.tags, req.body.post, function(err) {
		var url = encodeURI('/u/' + req.params.name + '/' + req.params.time + '/' + req.body.title);
		if (err) {
			req.flash('error', err);
			return res.redirect(url); //出错！返回文章页
		}
		req.flash('success', '修改成功!');
		res.redirect(url); //成功！返回文章页
	});
});

app.get('/remove/:name/:time/:title', checkLogin);
app.get('/remove/:name/:time/:title', function(req, res) {
	var currentUser = req.session.user;
	Post.remove(currentUser.name, req.params.time, req.params.title, function(err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', '删除成功!');
		res.redirect('/blog');
	});
});

app.get('/tags', function (req, res) {
  Post.getTags(function (err, tags) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/blog');
    }
    res.render('tags', {
      title: '标签',
      tags: tags,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

app.get('/tags/:tag', function (req, res) {
  Post.getTag(req.params.tag, function (err, posts) {
    if (err) {
      req.flash('error',err); 
      return res.redirect('/blog');
    }
    res.render('archive', {
      title: 'TAG:' + req.params.tag,
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

app.use(function (req, res) {
  res.render("404");
});

function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.flash('error', '未登录!');
		res.redirect('/login');
	}
	next();
}

function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error', '已登录!');
		res.redirect('back');
	}
	next();
}

module.exports = app;