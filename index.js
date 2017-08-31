#!/usr/bin/nodejs --harmony_array_includes

'use strict';

const program = require('commander')

program
 .version('0.0.1')
 .command('temperature', 'Prints current temperature from GPIO.')
 .command('ac', 'Accepts a button name and transmits over IR.')
 .command('server', 'Runs a HomeKit accessory for controlling an AC')
 .parse(process.argv);
