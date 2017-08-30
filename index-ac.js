#!/usr/bin/env node

const program = require('commander');

program
  .arguments('<action>')
  .action(function(e){
      actionName = e;
  }).parse(process.argv);

if (typeof actionName === 'undefined' || !(/^(power|down|up|fan|timer|mode)$/i.test(actionName))) {
    console.error('Need one of "power", "down", "up", "fan", "timer", or "mode".');
    process.exit(1);
}

const lirc_node = require('lirc_node')
lirc_node.init()

const lircActions = {
    'down': 'temperature_up',
    'up': 'temperature_down',
    'mode': 'ac_mode'
};

const lircAction = lircActions.hasOwnProperty(actionName) ? lircActions[actionName] : actionName

lirc_node.irsend.send_once('LG_AKB73016012', lircAction)
