#!/usr/bin/env node

'use strict';

const program = require('commander')

program
 .version('0.0.1')
 .command('temperature', 'Prints current temperature from GPIO.')
 .command('ac', 'Accepts a button name and transmits over IR.')
 .parse(process.argv);
