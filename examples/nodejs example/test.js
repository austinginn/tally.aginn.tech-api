//Sample server side tally.aginn.tech implementation
var Tally = require("tally.aginn.tech-api");

const ts = new Tally();
console.log(ts);

const version = ts.apiVersion();
version.then((result) => {
    console.log("API Version: " + result);
});

//start a latency and server processing time check.
//data is returned on "latency" event
setInterval(() => {
    ts.latencyCheck();
}, 5000); //check every 5 seconds

//connected to tally.aginn.tech and new server created
ts.on("connected", (data) => {
    console.log("Tally Server ID: " + data);
});

//disconnected from tally.aginn.tech
ts.on("disconnected", (data) => {
    console.log("disconnected: " + data);
});

//latency data received here in ms
ts.on("latency", (data) => {
    console.log(data);
});

//tally bus array is receieved here
ts.on("tally", (data) => {
    console.log(data);
});

//tally server information including colors and demo mode info is returned here
ts.on("server", (data) => {
    console.log(data);
});

//update tally information
var tBus = 0; //program bus 1 in tally.aginn.tech implmentation OR whatever you want it to be
var cam = 1; //cam #
ts.updateTally(tBus, cam);

//update gui colors
var pgm = "#FF3333"; 
var pre = "#FCFF33";
var iso = "#3394FF";
var safe = "#33FF4C";
ts.updateColors(pgm, pre, iso, safe);

//turn on demo mode
ts.demoOn();

//turn off demo mode
setTimeout(() => {
    ts.demoOff();
}, 1000);

