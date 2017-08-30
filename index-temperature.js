#!/usr/bin/env node

'use strict'

const program = require('commander')
program
 .option('-u --unit <unit>', 'One of "celsius" or "fahrenheit"', /^(celsius|fahrenheit)$/i, 'fahrenheit')
 .parse(process.argv)

const i2c_htu21d = require('htu21d-i2c')
const connection = new i2c_htu21d()

connection.readTemperature(function(tempInC) {
    if (program.unit == 'celsius') {
        console.log(tempInC + '°C')
    } else {
        const tempInF = (tempInC * (9 / 5)) + 32
        console.log(tempInF + '°F')
    }
})
