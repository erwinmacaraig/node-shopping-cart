var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var Cart = require('../models/cart');
var paypal = require('paypal-rest-sdk');


var paypal_config = {
  "port": 5000,
  "api": {
    "host": "api.sandbox.paypal.com",
    "port": "",     
    "client_id": 'AY2watczj38urmMmH0B5OYXzy2YHIi1ZagBnrMcYvofxXOfPrlIst0toySBZYcmVkTmvp_KEffzOK7yJ',
    "client_secret": 'EHUv6kRUZ1j_QlK2NjRm47iSoQhYs_rgoX1juQ7_gui7sbvmgK4EmXi23MoHTEgKUdcgEjgptf0E0Liq'
  }
};
paypal.configure(paypal_config.api);



/* GET home page. */
router.get('/', function(req, res, next) {
  Product.find(function(err, docs){
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i+=chunkSize) {
      productChunks.push(docs.slice(i, i+chunkSize));
    }
    res.render('shop/index', { title: 'Shopping Cart', products: productChunks });
  });

});

router.get('/add-to-cart/:id', function(req, res, next){
  var productId = req.params.id;  
  var cart = new Cart(req.session.cart ? req.session.cart: {});

  Product.findById(productId, function(err, product){
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  });
});

router.get('/shopping-cart', function(req, res, next){
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', {products: null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice
  });
});

router.get('/checkout/stripe/', function(req, res, next){
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', {products: null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/checkout', {total: cart.totalPrice});
});

router.get('/checkout/paypal/', function(req, res, next){
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', {products: null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/checkout-paypal', {total: cart.totalPrice});
});

router.get('/payment/success/', function(req, res, next){
  console.log('req query ', req.query);
  console.log('session info', req.session);
  
  paypal.payment.execute(req.query.paymentId, {"payer_id": req.query.PayerID}, function (error, payment) {
    req.session.cart = null;
    if (error) {
      console.log(error);
      response.error = false;
      response.message = "Payment Successful.";
      // callback(response);
      res.render('gateway/paypal-success', {status: 'Payment successful but not stored'});
    } else {
      
      /*
      * inserting paypal Payment in DB
      */
      /*
      const insertPayment={
          userId : data.sessionData.userID,
          paymentId : paymentId,
          createTime : payment.create_time,
          state : payment.state,
          currency : "USD",
          amount: serverAmount,
          createAt : new Date().toISOString()
      }

      self.insertPayment(insertPayment,function(result){

        if(! result.isPaymentAdded){
          response.error = true;
          response.message = "Payment Successful, but not stored.";
          callback(response);
        }else{
          response.error = false;
          response.message = "Payment Successful.";
          callback(response);
        };
      });
      */
      res.render('gateway/paypal-success',{status: "Payment stored"});
    };
  });



  
});

router.get('/payment/cancel/', function(req, res, next){
  console.log('req query ', req.query);
  console.log('session info', req.session);
  res.render('gateway/paypal-failed',{});
});

router.post('/paypal/paynow/', function(req, res) {
  console.log("total = " + req.body.amount);
  console.log("currency = " + req.body.currency);  
  // paypal payment configuration.
 var payment = {
 "intent": "sale",
 "payer": {
   "payment_method": "paypal"
 },
 "redirect_urls": {
   "return_url": "http://localhost:3000/payment/success/",
   "cancel_url": "http://localhost:3000/payment/cancel/"
 },
 "transactions": [{
   "amount": {
     "total": parseInt(req.body.amount),
     "currency":  req.body.currency.toString()
   },
   "description": req.body.description
 }]
};
 
 paypal.payment.create(payment, function (error, payment) {
 if (error) {   
   console.log(error);
   console.log(error.response.details);
 } else {
   if(payment.payer.payment_method === 'paypal') {
     req.paymentId = payment.id;
     var redirectUrl;
     console.log(payment);
     for(var i=0; i < payment.links.length; i++) {
       var link = payment.links[i];
       if (link.method === 'REDIRECT') {
         redirectUrl = link.href;
       }
     }
     res.redirect(redirectUrl);
   }
 }
});
});

module.exports = router;
