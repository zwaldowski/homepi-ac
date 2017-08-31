#!/usr/bin/nodejs --harmony_array_includes

const program = require('commander')

program
  .option('-d, --device <device>', 'Device name for LIRC')
  .arguments('<action>')
  .action(function(e){
      actionName = e;
  }).parse(process.argv)

if (typeof program.device === 'undefined') {
    console.error('Need device name for LIRC.')
    process.exit(1)
}

if (typeof actionName === 'undefined' || !(/^(power|down|up|fan|timer|mode)$/i.test(actionName))) {
    console.error('Need one of "power", "down", "up", "fan", "timer", or "mode".')
    process.exit(1)
}

const lirc_node = require('lirc_node')
lirc_node.init()

const lircActions = {
    'power': 'KEY_POWER',
    'down': 'BTN_GEAR_DOWN',
    'up': 'BTN_GEAR_UP',
    'fan': 'KEY_MOVE',
    'timer': 'KEY_SLEEP',
    'mode': 'KEY_MODE'
};

const lircAction = lircActions.hasOwnProperty(actionName) ? lircActions[actionName] : actionName

lirc_node.irsend.send_once(program.device, lircAction)
