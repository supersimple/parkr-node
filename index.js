'use strict'

var express = require('express');
var app = express();
var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/parkr');
mongoose.model('updates',{occupied: Boolean, parking_spot: Number, created_at: Date});

app.get('/', function(request, response){
  //dead endpoint
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
  console.log(is_occupied, parking_spot);
  mongoose.model('updates').create({ occupied : is_occupied, parking_spot: parking_spot, created_at : new Date()});
  response.json({"update": true}); 
});

app.listen(7272, function(){
  console.log('listening on port 7272');
});