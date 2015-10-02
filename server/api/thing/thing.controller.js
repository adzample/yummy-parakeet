/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Thing = require('./thing.model');

// Get list of things
exports.index = function(req, res) {
  Thing.find(function (err, things) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(things);
  });
};

// Get a single thing
exports.show = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.status(404).send('Not Found'); }
    return res.json(thing);
  });
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
  Thing.create(req.body, function(err, thing) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(thing);
  });
};

exports.sendStripePayment = function(req, res, next) {
    var stripeToken = req.body.token.id;
    var amount = req.body.amount;
    var userId = req.body.userId;

    // Bookshelf.transaction(function(t){
    //   var charge = stripe.charges.create({
    //     amount: amount*100, // amount in cents, again
    //     currency: "usd",
    //     source: stripeToken,
    //     description: "Deposit charge"
    //   })
    //   .then(function(charge){
    //     return new Users.User({_id: userId}).fetch({require: true, transacting: t});
    //   })
    //   .then(function(user){
    //     var funds = Number(user.availableFinances()) + Number(req.body.amount);
    //     user.set('availableFinances', funds);
    //     return user.save(null, {transacting: t});
    //   })
    //   .then(function(user){
    //     var payment = new Users.Payment({
    //       type: 'deposit',
    //       userID: userId,
    //       amount: amount
    //     })
    //     return payment.save(null, {transacting: t});
    //   })
    //   .then(function(payment){
    //     t.commit();
    //   })
    //   .catch(function(err){
    //     console.log(err);
    //     t.rollback();
    //     if (err && err.type) {
    //       //THIS WAS A STRIPE ERROR
    //       switch (err.type) {
    //         case 'StripeCardError':
    //           // A declined card error
    //           // err.message; // => e.g. "Your card's expiration year is invalid."
    //           err.message = "Please check the validity of your card details and try again. Your card was not charged.";
    //           break;
    //         case 'StripeInvalidRequest':
    //           // Invalid parameters were supplied to Stripe's API
    //           console.log('Invalid parameters supplied to Stripes API');
    //           err.message = "There was a Stripe error. Your card was not charged. Please try again.";
    //           break;
    //         case 'StripeAPIError':
    //           // An error occurred internally with Stripe's API
    //           err.message = "Stripe couldn't process your request. Your card was not charged. Please try again.";
    //           break;
    //         case 'StripeConnectionError':
    //           // Some kind of error occurred during the HTTPS communication
    //           err.message = "Stripe couldn't process your request. Your card was not charged. Please try again.";
    //           break;
    //         case 'StripeAuthenticationError':
    //           // You probably used an incorrect API key
    //           console.log('Invalid STRIPE API KEY');
    //           err.message = "Stripe couldn't process your request. Your card was not charged. Please try again.";
    //           break;
    //       }
    //     return validationError(res, err.message);
    //     } else {
    //       var originalErr = String(err) + ' date: ' + Date.now() + ' amount: ' + amount + ' userId: ' + userId + ' stripeToken: ' + stripeToken + ' | ';
    //       //THIS ONE IS THE BAD ONE - STRIPE WORKED BUT OUR DB DID NOT
    //       new Users.Error({
    //         amount: amount,
    //         userID: userId,
    //         provider: 'stripe',
    //         error: String(err)
    //       }).save()
    //         .then(function(){
    //           err.message = "A database error occurred but all the details have been logged. Please email support@rivlr.com"
    //           return validationError(res, err.message);
    //         })
    //         .catch(function(err2){
    //           console.log('door2')
    //           console.log(err2);
    //           err.message = "An internal error occurred. Please contact support@rivlr.com"
    //           fs.appendFileSync('errors.txt', originalErr);
    //           return validationError(res, err.message);
    //         })
    //     }
    //   })
    // }).then(function(){
    //   console.log('successful deposit');
    //   return res.send(200);
    // })
    // .catch(function(err, more, more2){
    //   console.log(err);
    // })

  }

// Updates an existing thing in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Thing.findById(req.params.id, function (err, thing) {
    if (err) { return handleError(res, err); }
    if(!thing) { return res.status(404).send('Not Found'); }
    var updated = _.merge(thing, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(thing);
    });
  });
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  Thing.findById(req.params.id, function (err, thing) {
    if(err) { return handleError(res, err); }
    if(!thing) { return res.status(404).send('Not Found'); }
    thing.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}