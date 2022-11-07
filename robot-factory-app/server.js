const express = require('express');
const EventEmitter = require('events');
const path = require('path');
var mqtt = require('mqtt');
const morgan = require('morgan');


// Subscription clients to the MQTT broker
var clientRobot  = mqtt.connect("mqtt://192.168.20.19",{clientId:"robot-subscriber"});
var clientCharger  = mqtt.connect("mqtt://192.168.20.19",{clientId:"charger-subscriber"});
// List of topics available at the broker
var topic_list=["robot-messages", "charger-messages"];

// Event emitter used to handle incoming data
const onReceiveMessage = new EventEmitter()

const app = express();

// Logging
app.use(morgan('dev'));

// Express app middleware
app.use(express.static(path.join(__dirname, 'public')));

// - - - - - Endpoints for viewing data - - - - -
app.route('/robots').get(async (req, res) => {
    res.sendFile(path.join(__dirname) + '/views/robots.html');
});
app.route('/chargers').get(async (req, res) => {
    res.sendFile(path.join(__dirname) + '/views/chargers.html');
});

// - - - - - Data end points - - - - -
// Dummy data as initial state for the data API
// In this prototype no database is used, this list acts as the database
let dataSource = {'robot':{}, 'charger':{}};

app.route('/robot-data').get( async (req, res) => {
    res.json([
        dataSource['robot'],
    ]);
});
app.route('/charger-data').get( async (req, res) => {
    res.json([
        dataSource['charger'],
    ]);
});

// Handling wrong url
app.all('*', async (req, res) => {
    res.status(404).sendFile(path.join(__dirname) + '/views/404.html');
});

/* - - - - Receiving data from subscriber - - - - */

// Updates the data source entry for the relevant device
// If there isn't an entry for that device it will be added
const UpdateData = (data, dataIndex) => {
    dataSource[dataIndex][data.id] = data;
};

// Event that fires when a message is received
onReceiveMessage.on('message-event', (message, index) => {
    UpdateData(message, index);
});

// Subscribing to the MQTT topics
clientRobot.on("connect", () => {
    clientRobot.subscribe(topic_list[0]);
    console.log("Connected to robot publisher: " + clientRobot.connected);
});
clientCharger.on("connect", () => {
    clientCharger.subscribe(topic_list[1]);
    console.log("Connected to charger subscriber: " + clientCharger.connected);
});

// Handlers for when a message is received from the MQTT
clientRobot.on("message", async function(topic, message, packet) {
    try {
        var out = await JSON.parse(message);
        onReceiveMessage.emit('message-event', out, 'robot');
    } catch (error) {
        console.log(error);
    }
});
clientCharger.on("message", async function(topic, message, packet) {
    try {
        var out = await JSON.parse(message);
        onReceiveMessage.emit('message-event', out, 'charger');
    } catch (error) {
        console.log(error);
    }
});

// Handle errors with the MQTT connection
clientRobot.on("error", function(error){
    console.log("Can't connect to robot client.\n" + error);
    process.exit(1);
});

clientCharger.on("error", function(error){
    console.log("Can't connect to charger client.\n" + error);
    process.exit(1);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, _ => {
    console.log(`App deployed at Port ${PORT}`);
});