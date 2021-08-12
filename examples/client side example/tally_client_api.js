//Created by Austin Ginn for use with tally.aginn.tech
//Client side tally api implementation
//requires jquery
console.log('tally_api.js loaded');

//Globals
var socket = io();
var clientId = cidGen();

//Default colors
var previewColor = "#FCFF33";
var programColor = "#FF3333";
var safeColor = "#33FF4C";
var isoColor = "#3394FF";


//function called when api call fails
//set this to your own custom function
var disconnected = function () {
  console.log("disconnected");
};

//Generate client ID
function cidGen() {
  var retVal = Math.floor(100000 + Math.random() * 900000)
  console.log("Client ID: " + retVal);
  return retVal;
}

//receive cleanup message if instance times out
function receiveCleanup(id, callback) {
  socket.on(id + "_cleanup", function (data) {
    if (callback) {
      //if callback was provided call this
      callback(data);
    } else {
      //default to disconnected function
      disconnected();
    }
  });
}

//Socket.io receive tally information
function receiveTally(id, callback) {
  socket.on(id, function (data) {
    callback(data);
  });
};

//Socket.io receive instance options
function receiveOptions(id, callback) {
  socket.on(id + "_server", function (msg) {
    callback(msg);
  });
}

//Socket.io receive latency options
function receiveLatency(id, callback) {
  socket.on(id + "_" + clientId + "_latency", function (data) {
    callback(data);
  });
}

//Socket.io receive demo messages
function receiveDemoMessages(id, callback) {
  socket.on(id + "_msg", function (msg) {
    callback(msg);
  });
}

//Create New Tally Instance
function newInstance(callback) {
  $.ajax({
    'url': '/api/new',
    'type': 'GET',
    'success': function (data) {
      console.log(data);
      //Results Check
      if (data.result === "success") {
        callback(data.data);
        return 0;
      } else {
        //Failed so log why or maybe implement a retry
        console.log(data.reason);
        disconnected();
        return -1;
      }
    }
  });
};

//Start a latency check
function checkLatency(id, callback) {
  var startTime = new Date().getTime();
  $.ajax({
    'url': '/api/latency?id=' + id + '&cid=' + clientId + '&ts=' + startTime,
    'type': 'GET',
    'success': function (data) {
      //do something on success if you want
      if (data.result === "success") {
        if (callback) {
          callback(data);
        }
        return 0;
      } else {
        //Failed so log why or maybe implement a retry
        console.log(data.reason);
        disconnected();
        return -1;
      }
    }
  });
}

//Set colors used for program preview and iso
function updateColors(id, callback) {
  $.ajax({
    'url': '/api/color?id=' + id + '&pgm=' + programColor.substr(1) + '&pre=' + previewColor.substr(1) + '&iso=' + isoColor.substr(1) + '&safe=' + safeColor.substr(1),
    'type': 'GET',
    'success': function (data) {
      //need to check data here
      if (data.result === "success") {
        if (callback) {
          callback(data);
        }
        return 0;
      } else {
        //Failed so log why or maybe implement a retry
        console.log(data.reason);
        disconnected();
        return -1;
      }
    }
  });
}

function demoOn(id, callback) {
  $.ajax({
    'url': '/api/demo/on' + '?id=' + id,
    'type': 'GET',
    'success': function (data) {
      //need to check data here
      if (data.result === "success") {
        if (callback) {
          callback(data);
        }
        return 0;
      } else {
        //Failed so log why or maybe implement a retry
        console.log(data.reason);
        disconnected();
        return -1;
      }
    }
  });
}

function demoOff(id, callback) {
  $.ajax({
    'url': '/api/demo' + '?id=' + id,
    'type': 'GET',
    'success': function (data) {
      //need to check data here
      if (data.result === "success") {
        if (callback) {
          callback(data);
        }
        return 0;
      } else {
        //Failed so log why or maybe implement a retry
        console.log(data.reason);
        disconnected();
        return -1;
      }
    }
  });
}

//Verify Tally Instance Exists
function verifyInstance(id, callback) {
  $.ajax({
    'url': '/api/verify?id=' + id,
    'type': 'GET',
    'success': function (data) {
      //Results Check
      if (data.result === "success") {
        if (data.data) {
          //tally instance exists
          if (callback) {
            callback(data.data);
          }
          return 0;
        } else {
          //tally instance doesn't exist
          //Failed so log why or maybe implement a retry
          console.log(data.reason);
          disconnected();
          return -1;
        }
      } else {
        //Failed so log why
        //Failed so log why or maybe implement a retry
        console.log(data.reason);
        disconnected();
        return -1;
      }
    }
  });
}

//Update Tally information
function updateTally(id, tBus, cam, callback) {
  $.ajax({
    'url': '/api/update?id=' + id + '&tBus=' + tBus + '&cam=' + cam,
    'type': 'GET',
    'success': function (data) {
      console.log(data);
      //Results Check
      if (data.result === "success") {
        //Do something with pID
        callback(data.data);
        return 0;
      } else {
        //Failed so log why
        console.log(data.reason);
        disconnected();
        return -1;
      }
    }
  });
}

//Initial Tally request
function initTally(id, callback) {
  $.ajax({
    'url': '/api/tally?id=' + id,
    'type': 'GET',
    'success': function (data) {
      console.log(data);
      //Results Check
      if (data.result === "success") {
        //Do something with pID
        //var pID = data.data;
        callback(data.data);
      } else {
        //Failed so log why
        console.log(data.reason);
        disconnected();
        return -1;
      }
    }
  });
}

//Inital Instance Options Request
function initOptions(id, callback) {
  $.ajax({
    'url': '/api/server?id=' + id,
    'type': 'GET',
    'success': function (data) {
      //need to check data here
      if (data.result == "success") {
        //do something on success
        callback(data.data);
        return 0;
      } else {
        //failed
        console.log(data.result);
        if (disconnected) {
          disconnected();
        }

        return -1;
      }
    }
  });
}

//keep tally instance alive
function keepalive(id, callback, minutes) {
  //default to 5 minutes
  if (!minutes) {
    minutes = 5;
  }
  //interval of request
  var interval = minutes * 60 * 1000;

  setInterval(function () {
    $.ajax({
      'url': '/api/keepalive?id=' + id,
      'type': 'GET',
      'success': function (data) {
        console.log(data);
        //Results Check
        if (data.result === "success") {
          //Do something on success
          if (callback) {
            callback(data);
          }
          return 0;
        } else {
          //Failed so log why
          console.log(data.reason);
          disconnected();
          return -1;
        }
      }
    })
  }, interval);
}
