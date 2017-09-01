#!/usr/bin/nodejs --harmony_array_includes

// Import modules
const
  package = require('./package.json'),
  program = require('commander')
  hap = require('hap-nodejs'),
  fs = require('fs'),
  i2c_htu21d = require('htu21d-i2c'),
  lirc_node = require('lirc_node')

// Parse options
program
  .option('-d, --device <device>', 'Device name for LIRC')
  .option('-c, --pin <pin>', 'PIN code for HomeKit', /^\d{3}-\d{2}-\d{3}$/i)
  .option('-n, --network-device <inet>', '"ifconfig" device name', 'wlan0')
  .option('-s, --serial-number <serialNumber>', 'Serial number for accessory')
  .option('-p, --port <port>', 'Port number for publishing accessory', 51827)
  .parse(process.argv)

if (typeof program.device === 'undefined') {
  console.error('Need device name for LIRC.')
  process.exit(1)
}

if (typeof program.pin === 'undefined') {
  console.error('Need PIN code for HomeKit.')
  process.exit(1)
}

if (typeof program.serialNumber === 'undefined') {
  console.error('Need serial number for accessory code.')
  process.exit(1)
}

// Initialize HAP
const Accessory = hap.Accessory,
  Characteristic = hap.Characteristic,
  Service = hap.Service,
  uuid = hap.uuid

hap.init()

// Initialize accessory
const accessory = new Accessory('Air Conditioner', uuid.generate('hap-nodejs:accessories:airconditioner'))

accessory.username = fs.readFileSync('/sys/class/net/' + (program.inet || 'wlan0') + '/address').toString().trim().toUpperCase()
accessory.pincode = program.pin

// set some basic properties
accessory
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "LG")
  .setCharacteristic(Characteristic.Model, "LW6016R")
  .setCharacteristic(Characteristic.SerialNumber, program.serialNumber)
  .setCharacteristic(Characteristic.FirmwareRevision, package.version || "1.0.0")

accessory.on('listening', function(port) {
  console.log("Server is running on port %s.", port);
})

accessory.on('identify', function(paired, callback) {
  console.log("Device identified!", paired)
  callback()
})

// Wire up the base objects.
const thermostat = accessory.addService(Service.Thermostat)
accessory.setPrimaryService(thermostat)

thermostat.getCharacteristic(Characteristic.TemperatureDisplayUnits)
  .setValue(Characteristic.TemperatureDisplayUnits.FAHRENHEIT)
  .on('set', function(value, callback){
    callback(new Error('Operation not supported'))
  })

// Configure the sensor characteristics.
const sensor = new i2c_htu21d()

thermostat.getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback){
    sensor.readTemperature(function(tempInC){
      callback(null, tempInC)
    })
  })

thermostat.getCharacteristic(Characteristic.CurrentRelativeHumidity)
  .on('get', function(callback){
    sensor.readHumidity(function(relativeHumidity){
      callback(null, relativeHumidity)
    })
  })

// Wire up IR state machine and characteristics.
lirc_node.init()

var stateData = {
  'heatingCoolingState': Characteristic.TargetHeatingCoolingState.OFF,
  'temperature': 20 // 68 F
}

thermostat.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
  .on('get', function(callback){
    callback(null, stateData.heatingCoolingState)
  })

thermostat.getCharacteristic(Characteristic.TargetHeatingCoolingState)
  .setValue(stateData.heatingCoolingState)
  .on('set', function(value, callback){
    console.log('Power state to %s.', value)

    function toggle(heatingCoolingState){
      lirc_node.irsend.send_once(program.device, 'KEY_POWER', function(){
        callback()
        thermostat.getCharacteristic(Characteristic.CurrentHeatingCoolingState).setValue(stateData.heatingCoolingState)
      })
    }

    if ((value !== Characteristic.TargetHeatingCoolingState.OFF) && (stateData.heatingCoolingState === Characteristic.TargetHeatingCoolingState.OFF)) {
      stateData.heatingCoolingState = Characteristic.TargetHeatingCoolingState.COOL
      toggle()
    } else if ((value === Characteristic.TargetHeatingCoolingState.OFF) && (stateData.heatingCoolingState !== Characteristic.TargetHeatingCoolingState.OFF)) {
      stateData.heatingCoolingState = Characteristic.TargetHeatingCoolingState.OFF
      toggle()
    } else {
      callback()
    }
  })

function fahrenheitToCelsius(temperature) {
    return (temperature - 32) / 1.8
}

function celsiusToFahrenheit(temperature) {
    return (temperature * 1.8) + 32
}

thermostat.getCharacteristic(Characteristic.TargetTemperature)
  .setProps({
    minValue: 16,
    maxValue: 30,
    minStep: 0.5
  })
  .on('get', function(callback){
    callback(null, stateData.temperature)
  })
  .on('set', function(newInC, callback){
    const oldInF = Math.round(celsiusToFahrenheit(stateData.temperature))
    const newInF = Math.round(celsiusToFahrenheit(newInC))
    newInC = Math.round(fahrenheitToCelsius(newInF) * 0.5) / 0.5

    stateData.temperature = newInC

    console.log('Set temperature to %s (from %s).', newInF, oldInF)

    thermostat.getCharacteristic(Characteristic.TargetHeatingCoolingState)
      .setValue(Characteristic.TargetHeatingCoolingState.COOL, function(error){
        if (error) {
          callback(error)
        } else {
          function handleNext(command, stepsRemaining){
            if (stepsRemaining >= 1) {
              lirc_node.irsend.send_once(program.device, command, function(){
                handleNext(command, stepsRemaining - 1)
              })
            } else {
              callback()
            }
          }

          if (oldInF < newInF) {
            handleNext('BTN_GEAR_UP', newInF - oldInF)
          } else if (oldInF > newInF) {
            handleNext('BTN_GEAR_DOWN', oldInF - newInF)
          } else {
            callback()
          }
        }
      })
  })

// And let's do this...
accessory.publish({
  port: program.port || 51827,
  username: accessory.username,
  pincode: accessory.pincode,
  category: Accessory.Categories.THERMOSTAT
})
