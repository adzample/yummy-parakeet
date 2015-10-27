'use strict';

var _ = require('lodash');
var Contact = require('./contact.model'); 
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hayden94103@gmail.com',    // your email here
    pass: 'tropical3'         // your password here
  }
});
// Get list of mailers
exports.sendMail = function(req, res) {
  var htmlContent = '<p>Name: ' + req.body.name + '</p>' +
                    '<p>Email: ' + req.body.email + '</p>' +
                    '<p>Message: ' + req.body.message + '</p>';
  var mailOptions = {
    to: 'robbieferguson139@gmail.com',                  // your email here
    subject: 'New message from Dwheels',
    from: req.body.name + ' <' + req.body.email + '>',
    sender: req.body.email,
    html: htmlContent
  };
  transporter.sendMail(mailOptions, function(err, info){
    if (err) {
      console.log(err);
    }else{
      console.log('Message sent: ' + info.response);
      return res.end('{"success" : "Updated Successfully", "status" : 200}');
    }
  });
};
