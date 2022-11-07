/* Data processing used in the IoT data simulator for the charger devices.
Each charger is given initial data which this script modifies each interval to simulate the device being occupied by a charging robot for a time.
Sample initial data:
{
    id: 1,
    longitude: -37.84666,
    latitude: 145.11441,
    occupied: false
}
Each device must be assigned a unique id.
*/

 function process(state, datasetEntry, deviceName) {

    // Get the chargers's id from its device name
    // Each device has name in the form 'robot-charger-##'
    state.id = deviceName.slice(14);
    id = parseInt(state.id);

    /* - - - - - Simulating occupation - - - - - */
    // If occupied is false, randomly simulate a robot beginning to use the charger
    if (state[state.id.concat("occupied")]===false)
    {
        if (Math.floor(Math.random() * 20) == 1) {
            state[state.id.concat("occupied")] = true;
            print("Charger " + id + " is occupied.");
        }
    }

    // Resets at a random interval later to simulate robot finishing its charge time
    if (state[state.id.concat("occupied")] === true)
    {
        if (Math.floor(Math.random() * 50) == 1) {
            state[state.id.concat("occupied")] = false;
            print("Charger " + id + " is no longer occupied.");
        }
    }

    // Creates new data if none exists, beginning with false
    if (!state[state.id.concat("occupied")])
    {
        state[state.id.concat("occupied")] = false;
    }

    /* - - - - - Simulating location - - - - - */
    // If data hasn't been stored for the latitude, create a random position
    if (!state[state.id.concat("longitude")])
    {
        state[state.id.concat("longitude")] = (Math.random() * (145.11506 - 145.11441) + 145.11441);
    }
    // If data hasn't been stored for the longitude, create a random position
    if (!state[state.id.concat("latitude")])
    {
        state[state.id.concat("latitude")] = (Math.random() * (-37.84666 - (-37.84731)) + -37.84731);
    }

    // Creates the JSON for this device at this interval
    return {
        timestamp: moment().valueOf(),
        id: id,
        latitude: state[state.id.concat("latitude")],
        longitude: state[state.id.concat("longitude")],
        occupied: state[state.id.concat("occupied")]
    };
}