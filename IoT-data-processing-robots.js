/* Data processing used in the IoT data simulator for the robot devices.
Each robot is given initial data which this script modifies each interval to simulate movement, battery loss, and proximity detections.
Sample initial data:
{
    id: 1,
    charge: 100,
    latitude: -37.84666,
    longitude: 145.11441,
    north: false,
    south: false,
    east: false,
    west: false
}
Each device must be assigned a unique id.
*/

 function process(state, datasetEntry, deviceName) {

    // Get the robot's id from its device name
    // Each device has name in the form 'robot-##'
    state.id = deviceName.slice(6);
    id = parseInt(state.id);

    /* - - - - - Simulating movement - - - - - */
    // If a data has already been stored for this device's latitude, modify data
    if (state[state.id.concat("latitude")])
    {
        // If we aren't about to go out of bounds and there are no proximity detections to the north or south, the direction is chosen randomly
        if(state[state.id.concat("latitude")] > -37.84729 && state[state.id.concat("latitude")] < -37.84668 && state[state.id.concat("north")] === false && state[state.id.concat("south")] === false)
        {
            // Add or subtract so we can go either north or south
            if (Math.floor(Math.random() * 2) == 1) {
                state[state.id.concat("latitude")] += .00001 * Math.floor(Math.random() * 3);
            }
            else
            {
                state[state.id.concat("latitude")] -= .00001 * Math.floor(Math.random() * 3);
            }
        }
        // If we are at the southern limit of the factory or there is a proximity detection to the south
        if(state[state.id.concat("latitude")] <= -37.84729 || state[state.id.concat("south")] === true)
        {
            // must add to go north
            state[state.id.concat("latitude")] += .00001 * Math.floor(Math.random() * 3);
            state[state.id.concat("south")] = false;
            print("————————————-ADDING TO MOVE NORTH————————————-"); // These messages appear in the Docker console, and are used for debugging
        }
        // If we are at the north limit of the factory or there is a proximity detection to the north
        if(state[state.id.concat("latitude")] >= -37.84668 || state[state.id.concat("north")] === true)
        {
            // must subtract
            state[state.id.concat("latitude")] -= .00001 * Math.floor(Math.random() * 3);
            state[state.id.concat("north")] = false;
            print("————————————-SUBTRACTING TO MOVE SOUTH————————————-");
        }
    }
    // If data hasn't been stored for the latitude, create a slightly random starting position
    if (!state[state.id.concat("latitude")])
    {
        state[state.id.concat("latitude")] = -37.84666 - (.00001 * Math.floor(Math.random() * 10));
    }
    // If a data has already been stored for this device's longitude, modify data
    if (state[state.id.concat("longitude")])
    {
        // If we aren't about to go out of bounds and there are no proximity detections to the east or west, the direction is chosen randomly
        if(state[state.id.concat("longitude")] > 145.11443 && state[state.id.concat("longitude")] < 145.11504 && state[state.id.concat("east")] === false && state[state.id.concat("west")] === false) // Add or subtract
        {
            // Add or subtract so we can go either east or west
            if (Math.floor(Math.random() * 2) == 1) {
                state[state.id.concat("longitude")] += .00001 * Math.floor(Math.random() * 3);
            }
            else {
                state[state.id.concat("longitude")] -= .00001 * Math.floor(Math.random() * 3);
            }
        }
        // If we are at the west limit of the factory or there is a proximity detection to the west
        if(state[state.id.concat("longitude")] <= 145.11443 || state[state.id.concat("west")] === true)
        {
            // must add
            state[state.id.concat("longitude")] += .00001 * Math.floor(Math.random() * 3);
            state[state.id.concat("west")] = false;
            print("————————————-ADDING TO MOVE EAST————————————-");
        }
        // If we are at the east limit of the factory or there is a proximity detection to the east
        if(state[state.id.concat("longitude")] >= 145.11504 || state[state.id.concat("east")] === true)
        {
            // must subtract
            state[state.id.concat("longitude")] -= .00001 * Math.floor(Math.random() * 3);
            state[state.id.concat("east")] = false;
            print("————————————-SUBTRACTING TO MOVE WEST————————————-");
        }
    }
    // If data hasn't been stored for the longitude, create a slightly random starting position
    if (!state[state.id.concat("longitude")])
    {
        state[state.id.concat("longitude")] = 145.11441 + (.00001 * Math.floor(Math.random() * 10));
    }
    // Error handling, used for debugging
    if (state[state.id.concat("latitude")] < -37.84731 || state[state.id.concat("latitude")] > -37.84666 || state[state.id.concat("longitude")] < 145.11441 && state[state.id.concat("longitude")] > 145.11506)
    {
        print("————————————-OUT OF BOUNDS————————————-");
    }

    /* - - - - - Simulating battery charge loss - - - - - */
    // If there is already a battery state, simulate losing charge until it reaches 0
    if (state[state.id.concat("batt")])
    {
        if (state[state.id.concat("batt")] > 0)
        {
            state[state.id.concat("batt")] -= .1 * Math.floor(Math.random() * 3);
        }
        else
        {
            state[state.id.concat("batt")] = 0;
        }
    }
    // If there isn't battery data stored yet, create a slight random start
    if (!state[state.id.concat("batt")])
    {
        state[state.id.concat("batt")] = 100 - (Math.floor(Math.random() * 10));
    }

    /* - - - - - Simulating proximity alerts - - - - - */
    // For each direction, randomly create a proximity alert approximately every 50 intervals
    if (state[state.id.concat("north")]===false)
    {
        if (Math.floor(Math.random() * 50) == 1) {
            state[state.id.concat("north")] = true;
            print("Detection in the north for " + id);
        }
    }
    if (state[state.id.concat("south")]===false)
    {
        if (Math.floor(Math.random() * 50) == 1) {
            state[state.id.concat("south")] = true;
            print("Detection in the south for " + id);
        }
    }
    if (state[state.id.concat("east")]===false)
    {
        if (Math.floor(Math.random() * 50) == 1) {
            state[state.id.concat("east")] = true;
            print("Detection in the east for " + id);
        }
    }
    if (state[state.id.concat("west")]===false)
    {
        if (Math.floor(Math.random() * 50) == 1) {
            state[state.id.concat("west")] = true;
            print("Detection in the west for " + id);
        }
    }

    // Creates new data if none exists
    if (!state[state.id.concat("north")])
    {
        state[state.id.concat("north")] = false;
    }
    if (!state[state.id.concat("south")])
    {
        state[state.id.concat("south")] = false;
    }
    if (!state[state.id.concat("east")])
    {
        state[state.id.concat("east")] = false;
    }
    if (!state[state.id.concat("west")])
    {
        state[state.id.concat("west")] = false;
    }

    // Creates the JSON for this device at this interval
    return {
        timestamp: moment().valueOf(),
        id: id,
        battery: parseFloat(state[state.id.concat("batt")].toFixed(1)),
        longitude: parseFloat(state[state.id.concat("longitude")]),
        latitude: parseFloat(state[state.id.concat("latitude")]),
        north: state[state.id.concat("north")],
        south: state[state.id.concat("north")],
        east: state[state.id.concat("east")],
        west: state[state.id.concat("west")]
    };
}