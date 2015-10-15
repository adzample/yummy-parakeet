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
var stripe = require("stripe")("sk_test_xZ6eznYeZYCT53QJgJY5De7F");

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
    var address = req.body.address;
    var cart = JSON.stringify(req.body.cart);
    var shippingAddress = {
      name: address.shipping_name,
      address: {
        city: address.shipping_address_city,
         country: address.shipping_address_country_code,
         line1: address.shipping_address_line1,
         line2: address.shipping_address_line2 || '',
         postal_code: address.shipping_address_zip,
         state: address.shipping_address_state
       }
     };

      var charge = stripe.charges.create({
        amount: amount*100, // amount in cents, again
        currency: "usd",
        source: stripeToken,
        description: cart,
        metadata: {address: JSON.stringify(address), email: stripeToken.email, cart: cart},
        receipt_email: stripeToken.email,
        shipping: shippingAddress
      })
      .then(function(charge){
        console.log(charge);
        return res.send(200);
      })
      .catch(function(err){
        console.log(err);
        if (err && err.type) {
          //THIS WAS A STRIPE ERROR
          switch (err.type) {
            case 'StripeCardError':
              // A declined card error
              // err.message; // => e.g. "Your card's expiration year is invalid."
              err.message = "Please check the validity of your card details and try again. Your card was not charged.";
              break;
            case 'StripeInvalidRequest':
              // Invalid parameters were supplied to Stripe's API
              console.log('Invalid parameters supplied to Stripes API');
              err.message = "There was a Stripe error. Your card was not charged. Please try again.";
              break;
            case 'StripeAPIError':
              // An error occurred internally with Stripe's API
              err.message = "Stripe couldn't process your request. Your card was not charged. Please try again.";
              break;
            case 'StripeConnectionError':
              // Some kind of error occurred during the HTTPS communication
              err.message = "Stripe couldn't process your request. Your card was not charged. Please try again.";
              break;
            case 'StripeAuthenticationError':
              // You probably used an incorrect API key
              console.log('Invalid STRIPE API KEY');
              err.message = "Stripe couldn't process your request. Your card was not charged. Please try again.";
              break;
          }
        return res.status(500).send(err.message);
        } else {
          err.message = "An internal error occurred. Please contact support@rivlr.com"
          return res.status(500).send(err.message);
        }
      })

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