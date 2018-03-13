var express = require('express');
var router = express.Router();
var captchapng = require('captchapng');
var userService = require('../service/user/userservice');
var RestMsg = require('../common/restmsg');
var crypto = require('../common/encrypt');

router.get('/', function(req, res) {
    if (req.session.uid) {
        var restmsg = new RestMsg();
        userService.getById(req.session.uid, function(err, bo) {
            if (err) {
                restmsg.errorMsg(err);
                res.send(restmsg);
                return;
            }
            if (bo) {
                res.render('index', {
                    "user": {
                        nickname: bo.nickname,
                        username: bo.username,
                        phone: bo.phone,
                        email: bo.email
                    }
                });
            }
        });
    } else {
        res.redirect('/login');
    }
});

router.get('/code', function(req, res) { //生成图片验证码
    var code = parseInt(Math.random() * 9000 + 1000);
    req.session.validat_num = code;
    var p = new captchapng(180, 50, code); // width,height,numeric captcha
    p.color(245, 245, 245, 1); // First color: background (red, green, blue, alpha)
    p.color(0, 0, 0, 150); // Second color: paint (red, green, blue, alpha)
    var img = p.getBase64();
    var imgbase64 = new Buffer(img, 'base64');
    res.send(imgbase64);
});

router.route('/login')
    .get(function(req, res) {
        if (req.session.uid) {
            res.redirect('/');
        } else {
            userService.count({}, function(err, count) {
                if (err) {
                    restmsg.errorMsg(err);
                    res.send(restmsg);
                    return;
                }
                if (count != 0) {
                    res.render('login', { status: 0, msg: '' });
                } else {
                    res.redirect('/register');
                }
            });
        }
    })
    .post(function(req, res) {
        var restmsg = new RestMsg();
        if (req.body.password && req.body.username) {
            var username = req.body.username;
            var password = req.body.password;

            if (req.session.validat_num && req.body.code != req.session.validat_num) {
                res.render('login', { status: -1, msg: '验证码错误！' });
                return;
            }
            userService.findOne({ username: username, password: crypto.md5Hash(password) }, function(err, bo) {
                if (err) {
                    restmsg.errorMsg(err);
                    res.send(restmsg);
                    return;
                }
                if (bo) {
                    req.session.uid = bo["_id"];
                    req.session.nickname = bo["nickname"];
                    res.redirect('/');
                } else {
                    res.render('login', { status: -1, msg: "用户名或密码错误" });
                }
            });
        } else {
            res.render('login', { status: 0, msg: "" });
        }
    });

router.route('/register')
    .get(function(req, res) {
        if (req.session.uid) {
            res.redirect('/');
        } else {
            userService.count({}, function(err, count) {
                if (err) {
                    restmsg.errorMsg(err);
                    res.send(restmsg);
                    return;
                }
                if (count != 0) {
                    res.redirect('/login');
                } else {
                    res.render('register', { status: 0, msg: '' });
                }
            });
        }
    })
    .post(function(req, res) {
        var restmsg = new RestMsg();
        if (req.body.password && req.body.username) {
            req.body.password = crypto.md5Hash(req.body.password)
            userService.save(req.body, function(err, bo) {
                if (err) {
                    restmsg.errorMsg(err);
                    res.send(restmsg);
                    return;
                }
                if (bo) {
                    res.redirect('/');
                } else {
                    res.render('register', { status: -1, msg: "注册失败" });
                }
            });
        }
    });

router.get('/logout', function(req, res, next) {
    if (req.session) {
        req.session.uid = null;
        req.session.validat_num = null;
        req.session.possword = null;
        res.clearCookie('uid');
        res.clearCookie('validat_num');
        res.clearCookie('possword');
        req.session.destroy();
    }
    res.redirect('/login');
});

module.exports = router;