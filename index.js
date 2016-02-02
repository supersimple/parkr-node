'use strict'

var config = require('./config');

var express = require('express');
var app = express();

var slack = require('slack-notify')(config.slack_url);
    
var mongoose = require('mongoose');

mongoose.connect(config.mongodb);
mongoose.model('updates',{occupied: Boolean, parking_spot: Number, created_at: Date});

app.get('/', function(request, response){
  //dead endpoint
  response.json({"status": 'online'});
});

app.get('/status/:parking_spot', function(request, response){
  //gather most recent stored status from db
  var parking_spot = parseInt(request.params.parking_spot);
  
  mongoose.model('updates').find({parking_spot: parking_spot}).sort({_id: -1}).limit(1).exec(function(err,update){
    var stat = update[0].occupied;  
    response.json({"status": stat});
  });
});

app.get('/update/:parking_spot/:occupied', function(request, response){
  //create a db record here
  var is_occupied = request.params.occupied;
  var parking_spot = parseInt(request.params.parking_spot);
  // console.log(is_occupied, parking_spot);
  var occupied_text = is_occupied == 0 || is_occupied == 'true' ? "taken" : "available";
  mongoose.model('updates').create({ occupied : is_occupied, parking_spot: parking_spot, created_at : new Date()});
  slack.send({
    text: 'Parking Spot #'+parking_spot+' is '+ occupied_text +'.',
    username: 'Petr Parkr'
  });
  response.json({"update": true}); 
});

app.listen(config.express_port, function(){
  console.log('listening on port '+config.express_port);
});