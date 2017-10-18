var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');
var mongojs = require('mongojs');
var db = mongojs(require('../config/db'), ['restfulmail']);
var userCollection = db.collection('users');
var jwt = require('jsonwebtoken');
function token_status(req,res,next){
    if(req.cookies.token){
        jwt.verify(req.cookies.token,'@#&*bhh%@$#bGG!',(err,decoded)=>{
            if(decoded){
                res.status(409).json({
                    success:false,
                    message : "Logged In"
                })
            }else{
                next();
            }
        })
    }else{
        next();
    }
}


router.post('/signup',token_status,(req,res)=> {
    if (!req.body.username || !req.body.password) {
        res.json({
            success: false,
        }, 416);
    } else {
        userCollection.findOne({
            email: req.body.email
        }, (err, docs) => {
            if (docs) {
                res.status(409).json({
                    success: false,
                    message: "used email"
                })
            } else {
                var user = {
                    username: req.body.username,
                    password: bcrypt.hashSync(req.body.password),
                };
                userCollection.save(user, (err, docs) => {
                    if (err) {
                        res.json({
                            success: false,
                            message: err
                        }, 500)
                    } else {
                        res.json({
                            success: true,
                            message: {
                                _id: docs._id,
                                created: docs.created
                            }
                        }, 200)
                    }
                })
            }
        })
    }
});

router.post('/login', token_status,(req, res) => {
    if (!req.body.email || !req.body.password) {
        res.status(416).json({
            success: false,
            message: "please check for 2 params"
        })
    } else {
        userCollection.findOne({
            email: req.body.email,
            active : true
        }, (err, docs) => {
            if (err) {
                res.status(500).json({
                    success: false,
                    message: err
                }, 500)
            } else {
                if (!docs) {
                    res.status(404).json({
                        success: false,
                        message: "can't find user"
                    })
                } else {
                    if (!bcrypt.compareSync(req.body.password, docs.password)) {
                        res.status(403).json({
                            success: false,
                            message: "mismatch password"
                        })
                    } else{
                        var token = jwt.sign({
                            _id: docs._id,
                            username: docs.username
                        }, '@#&*bhh%@$#bGG!');
                        res.status(200).cookie('token', token, { maxAge: 900000, httpOnly: true }).json({
                            success: true,
                            token: token
                        })
                    }
                }
            }
        })
    }
})



router.get('/logout', (req, res) => {
    res.clearCookie('CSRF_TOKEN').json({
        success: true,
        message: undefined
    })
})

module.exports = router;

module.exports = router;