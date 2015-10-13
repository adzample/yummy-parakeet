'use strict';

var _ = require('lodash');
var Contact = require('./contact.model'); 
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport();

exports.sendMail = function(req, res) {
 
    var data = req.body;
 
    transporter.sendMail({
        from: data.email,
        to: 'dankwheels@gmail.com',
        subject: 'Message from ' + data.name,
        text: data.message
    }, function (error, info) {
      if (error) {
        res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    })
    
 
};
// Get list of contacts
exports.index = function(req, res) {
  Contact.find(function (err, contacts) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(contacts);
  });
};

// Get a single contact
exports.show = function(req, res) {
  Contact.findById(req.params.id, function (err, contact) {
    if(err) { return handleError(res, err); }
    if(!contact) { return res.status(404).send('Not Found'); }
    return res.json(contact);
  });
};

// Creates a new contact in the DB.
exports.create = function(req, res) {
  Contact.create(req.body, function(err, contact) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(contact);
  });
};

// Updates an existing contact in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Contact.findById(req.params.id, function (err, contact) {
    if (err) { return handleError(res, err); }
    if(!contact) { return res.status(404).send('Not Found'); }
    var updated = _.merge(contact, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(contact);
    });
  });
};

// Deletes a contact from the DB.
exports.destroy = function(req, res) {
  Contact.findById(req.params.id, function (err, contact) {
    if(err) { return handleError(res, err); }
    if(!contact) { return res.status(404).send('Not Found'); }
    contact.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}