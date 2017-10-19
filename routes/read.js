const express = require('express');
const router = express.Router();
const mongojs = require('mongojs');
const db = mongojs(require('../config/db'), ['restfulmail']);
const mailCollection = db.collection('mail');
const jwt = require('jsonwebtoken');

function loginAuth(req, res, next){
    if (req.cookies.token) {
        jwt.verify(req.cookies.token, '@#&*bhh%@$#bGG!', function (err, decoded) {
            if (err || decoded == undefined) {
                res.status(401).json({
                    message: "Invaild Token"
                })
            } else {
                next();
            }
        });
    } else {
        res.status(403).json({
            message: "no token"
        })
    }
}

router.get('/',loginAuth,(req,res)=>{
    "use strict";
    mailCollection.find({

    })
})



module.exports = router;