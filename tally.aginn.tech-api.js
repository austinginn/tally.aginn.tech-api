'use strict';

//require
const request = require('request');
const io = require('socket.io-client');
const EventEmitter = require('events');


var tally = function () {
    //private methods and vars
    const cId = cidGen();
    const socket = io("https://tally.aginn.tech/");
    const eventEmitter = new EventEmitter();
    const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000 // 5 minutes

    //Generate client ID
    function cidGen() {
        var retVal = Math.floor(100000 + Math.random() * 900000);
        // console.log("Client ID: " + retVal);
        return retVal;
    }

    //constructor
    var constructor = function tally() {
        // socket.on('connect', (socket) => {
        //     // console.log('Connected to tally.aginn.tech!');
        // });


        //Get a tally server instance
        var t_server = initTallyClient();
        var version = getApiVersion();

        //API Version
        function getApiVersion() {
            return new Promise(resolve => { 
                request.get("https://tally.aginn.tech/api/version", (err, response, body) => {
                    if(err){
                        console.log(err);
                        return -1;
                    }

                    var result = JSON.parse(body);
                    if(result.result == "success"){
                        resolve(result.data);
                        return 0;
                    }
                });
            });
        }


        //Connect to tally server and keep alive
        //Start socket.io listeners
        function initTallyClient() {
            // console.log("in init")
            return new Promise(resolve => {
                request.get("https://tally.aginn.tech/api/new", (err, response, body) => {
                    if (err) { console.log(err); return -1; }
                    // console.log(response.data);
                    var result = JSON.parse(body);

                    //handle errors
                    if (result.result == "success") {
                        // console.log("Tally Server: " + result.data);
                        resolve(result.data);
                        eventEmitter.emit("connected", result.data);

                        //Get inititial tally info
                        request.get('https://tally.aginn.tech/api/tally?id=' + result.data, (err, response, body) => {
                            if (err) {
                                console.log(err);
                                eventEmitter.emit("disconnected", err);
                                return -1;
                            }

                            var result = JSON.parse(body);

                            if (result.result == "success") {
                                eventEmitter.emit("tally", result.data);
                            }
                        });

                        //Get inititial server info
                        request.get('https://tally.aginn.tech/api/server?id=' + result.data, (err, response, body) => {
                            if (err) {
                                console.log(err);
                                eventEmitter.emit("disconnected", err);
                                return -1;
                            }

                            var result = JSON.parse(body);

                            if (result.result == "success") {
                                eventEmitter.emit("server", result.data);
                            }
                        });

                        ////////////////////////
                        //SOCKET.IO LISTERNERS//
                        ////////////////////////
                        //Latency
                        socket.on(result.data + "_" + cId + "_latency", (data) => {
                            var latency = new Date().getTime() - data.ogTS;
                            eventEmitter.emit("latency", { "processing_time": data.pt, "latency": latency });
                        });

                        //Tally info
                        socket.on(result.data, (data) => {
                            eventEmitter.emit("tally", data);
                        });

                        //Server info
                        socket.on(result.data + "_server", (data) => {
                            eventEmitter.emit("server", data);
                        });

                        //Cleanup
                        socket.on(result.data + "_cleanup", (data) => {
                            eventEmitter.emit("cleanup", data);
                        });



                        //keep tally instance alive while running
                        //handle if server disconnects
                        setInterval(function () {
                            request.get("https://tally.aginn.tech/api/keepalive?id=" + result.data, (err, response, body) => {
                                if (err) {
                                    console.log(err);
                                    eventEmitter.emit("disconnected", err);
                                    return -1;
                                }

                                //handle errors
                                if (JSON.parse(body).result == "success") {
                                    console.log("Tally Server: alive " + result.data);
                                }
                            });
                        }, KEEP_ALIVE_INTERVAL);
                    }
                });
            });
        }

        this.serverId = async () => {
            return await t_server;
        }

        this.apiVersion = async () => {
            return await version;
        }

        //Event Listeneres
        this.on = (event, callback) => {
            eventEmitter.on(event, (data) => {
                callback(data);
            });
        }

        this.demoOn = () => {
            t_server.then((result) => {
                request.get('https://tally.aginn.tech/api/demo/on?id=' + result, (err, response, body) => {
                    if (err) {
                        console.log(err);
                        eventEmitter.emit("disconnected", err);
                        return -1;
                    }
                });
            });
        }

        this.demoOff = () => {
            t_server.then((result) => {
                request.get('https://tally.aginn.tech/api/demo?id=' + result, (err, response, body) => {
                    if (err) {
                        console.log(err);
                        eventEmitter.emit("disconnected", err);
                        return -1;
                    }
                });
            });
        }

        this.latencyCheck = () => {
            t_server.then((result) => {
                request.get('https://tally.aginn.tech/api/latency?id=' + result + '&cid=' + cId + '&ts=' + new Date().getTime(), (err, response, body) => {
                    if (err) {
                        console.log(err);
                        eventEmitter.emit("disconnected", err);
                        return -1;
                    }
                });
            });
        }

        //update this to take args
        this.updateColors = (pgm, pre, iso, safe) => {
            t_server.then((result) => {
                request.get('https://tally.aginn.tech/api/color?id=' + result + '&pgm=' + pgm.substr(1) + '&pre=' + pre.substr(1) + '&iso=' + iso.substr(1) + '&safe=' + safe.substr(1), (err, response, body) => {
                    if (err) {
                        console.log(err);
                        eventEmitter.emit("disconnected", err);
                        return -1;
                    }
                });
            });
        }

        //Update Tally
        this.updateTally = (tBus, cam) => {
            t_server.then((result) => {
                request.get('https://tally.aginn.tech/api/update?id=' + result + '&tBus=' + tBus + '&cam=' + cam, (err, response, body) => {
                    if (err) {
                        console.log(err);
                        eventEmitter.emit("disconnected", err);
                        return -1;
                    }
                });
            });
        }



    }
    //end constructor

    //public static methods

    return constructor;
}();

module.exports = tally;
