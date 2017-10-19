var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs(require('../config/db'), ['restfulmail']);
var mailCollection = db.collection('outbound');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
let transporter = nodemailer.createTransport({
    host: 'localhost',
    secure:false,
    port: 587,
    tls: { rejectUnauthorized: false }
});
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
router.post('/send',loginAuth,(req,res,next)=>{
    var { to,subject,message } = req.body;
    if (!to || !subject || !message){
        res.sendStatus(417)
    }else {
        jwt.verify(req.cookies.token, '@#&*bhh%@$#bGG!', (err, decoded) => {
                let mailOptions = {
                    from: '"' + decoded.username + '"<' + decoded.username + '@' + req.get('host') + '>', // sender address
                    to: to, // list of receivers
                    subject: subject, // Subject line
                    text: entities.encode(message), // plain text body
                    html: message // html body
                };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    res.status(500).json({
                        success: false,
                        message: error
                    })
                } else {
                    let log = {
                        userInfo: decoded,
                        outbound: info
                    }
                    mailCollection.save(log, (err, docs) => {
                        "use strict";
                        res.status(200).json({
                            success: true,
                            message: `Message ${info.messageId} sent: ${info.response}`,
                            response: docs
                        })
                    })
                }
            });
        });
    }
});

router.get('/read',loginAuth,(req,res)=>{
    "use strict";
    jwt.verify(req.cookies.token,'@#&*bhh%@$#bGG!',(err,decoded)=> {
        mailCollection.find({
            "userInfo._id": decoded._id
        },(err,docs)=>{
                if(err){
                    res.status(500).json({
                        success:false,
                        message:err
                    })
                }else{
                    res.status(200).send(docs)
                }
        })
    })
})

router.get('/read/:id',loginAuth,(req,res)=>{
    "use strict";
    var { id } = req.params;
    jwt.verify(req.cookies.token,'@#&*bhh%@$#bGG!',(err,decoded)=> {
        mailCollection.findOne({
        _id : mongojs.ObjectId(id),
            "userInfo._id": decoded._id
      },(err,docs)=>{
          if(err){
              res.status(500).json({
                  success:false,
                  message:err
              })
          }else{
              res.status(200).send(docs)
          }
      })
    })
});

router.delete('/delete/:id',loginAuth,(req,res)=>{
    "use strict";
    var { id } = req.params;
    jwt.verify(req.cookies.token,'@#&*bhh%@$#bGG!',(err,decoded)=> {
        mailCollection.remove({
            _id:mongojs.ObjectId(id)
        },(err,docs)=>{
            if(err){
                res.status(500).json({
                    success:false,
                    message:err
                })
            }else{
                res.status(200).json({
                    success:true,
                    message:docs
                })
            }
        })
    })
})
module.exports = router;