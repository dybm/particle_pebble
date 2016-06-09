/******************** Requires ********************/
var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');


/******************** Variables ********************/
var access_token = "abcdefghij1234567890";
var devices = {};
function Device(id, connected) {
  this.id = id;
  this.connected = connected;
  this.variables = [];
}


/******************** Windows ********************/
var splashWindow = new UI.Window({
  backgroundColor: 'pictonBlue'
});
var deviceMenu = new UI.Menu();
var varMenu = new UI.Menu();
var infoCard = new UI.Card();


/******************** Text Elements ********************/
var particleLogo = new UI.Text({
  position: new Vector2(0,30),
  size: new Vector2(144,168),
  text:'Particle\nFor\nPebble',
  font:'BITHAM_30_BLACK',
  color:'white',
  textOverflow:'wrap',
  textAlign: 'center',
  backgroundColor:'pictonBlue'
});


/******************** AJAX Functions ********************/
function getDevices(cfunc, efunc) {
  ajax(
    {
      url: "https://api.particle.io/v1/devices/?access_token=" + access_token,
      type: "json"
    },
    function (data) {
      //loop through data to extract device names and ids
      for (var i in data) {
        var name = data[i].name;
        var id = data[i].id;
        var connected = data[i].connected;
        //add a new element to the devices object with the device name as the key
        devices[name] = new Device(id, connected);
      }
      cfunc();
    },
    function (error) {
      efunc();
    }
  );
}

function getVariables(device_name, cfunc, efunc) {
  ajax(
    {
      url: "https://api.particle.io/v1/devices/" + devices[device_name].id + "/?access_token=" + access_token,
      type: "json"
    },
    function (data) {
      //fill the variable array with the found variable names
      for (var i in data.variables) {
        devices[device_name].variables.push(i);
      }
      cfunc();
    },
    function (error) {
      efunc();
    }
  );
}

function getValue(device_name, variable, cfunc, efunc) {
  ajax(
    {
      url: "https://api.particle.io/v1/devices/" + devices[device_name].id + "/" + variable + "?access_token=" + access_token,
      type: "json"
    },
    function (data) {
      //get the variable result and the last updated time
      var result = data.result;
      var updated = data.coreInfo.last_heard;
      //check if result is zero
      if (result === 0) {
        //convert zero to string so it displays as "0" in the card
        result = "0";
      } else if (typeof(result) === 'number' && result % 1 !== 0) {
        //if the result is a number that is not an integer, round it to two decimals
        result = result.toFixed(2);
      }
      //send the result and the updated timestamp to the callback function
      cfunc(result, updated);
    },
    function (error) {
      efunc();
    }
  );
}


/******************** Main ********************/
//add text to the splashwindow and display it
splashWindow.add(particleLogo);
splashWindow.show();

//attempt to get the available devices
getDevices(getDevicesSuccess, getDevicesError);

//getDevices callback function
function getDevicesSuccess() {
  //get the number of devices found
  var num = Object.keys(devices).length;
  //attempt to load all variables for each device
  for (var name in devices) {
    getVariables(name, getVariablesSuccess, getVariablesError);
  }
  
  //getVariables callback function
  function getVariablesSuccess() {
    //decrement the counter variable
    num--;
    if (num === -1) {
      //no devices were found
      showCard('Sorry!', '', 'No devices were found.');
    } else if (num === 0) {
      //all getVariable callbacks have finished - create the device menu
      createDeviceMenu();
    }
  }
  //getVariables error function
  function getVariablesError() {
    showCard('Error', '', 'Could not get device variables!');
  }
}
//getDevices error function
function getDevicesError() {
  showCard('Error', '', 'Could not load devices!');
}

function createDeviceMenu() {
  //initialize array to hold the menu items
  var items = [];
  //build the device menu items (menu of all common device names)
  for (var i in devices) {
    items.push({
      title: i,
      subtitle: (devices[i].connected) ? 'online' : 'offline'
    });
  }
  var section = {
    title: 'Select Your Device',
    items: items
  };
  deviceMenu.section(0, section);
  //add the device menu onclick event
  deviceMenu.on('select', function(e) {
    //load the next menu with corresponding variables
    createVariableMenu(e.itemIndex);
  });
  //display the menu and hide the splash window
  deviceMenu.show();
  splashWindow.hide();
}

function createVariableMenu(i) {
  //get object keys as an array
  var keys = Object.keys(devices);
  //get array of device variables
  var variables = devices[keys[i]].variables;
  //check if no variables were found
  if (variables.length === 0) {
    showCard('Sorry!', '', 'No variables were found for this device.');
  } else {
    //build the variable selection menu items
    var items = [];
    for (var v in variables) {
      items.push({
        title: variables[v],
        subtitle: ''
      });
    }
    var section = {
      title: 'Select a Variable',
      items: items
    };
    varMenu.section(0, section);
    //add the variable menu onclick event
    varMenu.on('select', function(e) {
      createVariableCard(i, e.itemIndex);
    });
    varMenu.show();
  }
}


function createVariableCard(i, v) {
  //get object keys as an array
  var keys = Object.keys(devices);
  //get the device name
  var name = keys[i];
  //get the selected variable from the selected device
  var variable = devices[name].variables[v];
  //request the variable value with ajax function
  getValue(name, variable, getValueSuccess, getValueError);
  
  function getValueSuccess(result, updated) {
    //convert updated time string into usable format
    var timestr = "Last Updated:\n" + convertTime(updated);
      
    showCard(variable, result, timestr);
  }
  function getValueError() {
    showCard('Error', '', 'Could not load variable data!');
  }
}


/******************** Referenced Functions ********************/
function convertTime(timestamp) {
  var date = new Date(timestamp);
  var Y = date.getFullYear();
  var M = "0" + (date.getMonth() + 1);
  var D = "0" + date.getDate();
  var h = date.getHours();
  var m = "0" + date.getMinutes();
  var s = "0" + date.getSeconds();
  var ampm = (h > 11) ? "pm" : "am";
  h = (h > 12) ? h-12 : h;
  return Y + '-' + M.substr(-1, 2) + '-' + D.substr(-1, 2) + ' ' + h + ':' + m.substr(-1, 2) + ':' + s.substr(-1, 2) + ' ' + ampm;
}

function showCard(title, subtitle, body) {
  infoCard.title(title);
  infoCard.subtitle(subtitle);
  infoCard.body(body);
  infoCard.show();
}









