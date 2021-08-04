# tally.aginn.tech-api
Node module for https://tally.aginn.tech/api.  For more information about this free tally web service visit: https://tally.aginn.tech/about. If you are looking for the client side implementation go here: 

## Installation
```
npm install tally.aginn.tech-api --save
```
## Usage
```js 
const Tally  =  require("tally.aginn.tech-api");
const ts =  new  Tally();
```
A new tally server instance will be created and kept alive while the node server is running. 

### Latency
```js
setInterval(() => {
	ts.latencyCheck();
}, 5000); //check ever 5 seconds
```
Use this to initiate a latency and server processing time check. Data will be returned on the "latency" event

### Events

   ```js
   ts.on("connected", (data) => {
	    console.log(data); //tally server id
	});
	
	ts.on("disconnected", (data) => {
		console.log("disconnected: "  +  data); //reason disconnected if one
	});
	
	ts.on("latency", (data) => {
		console.log(data); //{"processing_time": 0, "latency": 100} in ms
	});
	
	ts.on("tally", (data) => {
		console.log(data); //an array of length 30 (tally busses)
						   //each tally bus contains a cam #
	});
	
	ts.on("server", (data) => {
		console.log(data); //server information including colors and demo mode
	});
```

### Update Tally
```js
var tBus = 0; //program bus 1 in tally.aginn.tech implmentation OR whatever you want it to be
var cam = 1; //cam #
ts.updateTally(tBus, cam);
```
Use to send tally information to the server.  

### Update Colors
```js
var pgm = "#FF3333"; 
var pre = "#FCFF33";
var iso = "#3394FF";
var safe = "#33FF4C";

ts.updateColors(pgm, pre, iso, safe);
```
Use to update colors that represent possible tally states on tally.aginn.tech.  Colors must be 6 char hex value.

