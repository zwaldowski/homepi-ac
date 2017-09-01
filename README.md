# homepi-ac

Embedded HomeKit bridge for [ANAVI Infrared pHAT](http://anavi.technology/#products) (personal use).

## Dependencies

- Install packages. For Raspbian Stretch:

```shell
# apt install nodejs-legacy npm lirc i2c-tools
```

- Enable I2C and create lirc configuration. See [manual](http://www.lirc.org/html/irrecord.html), [“Setting Up LIRC on the RaspberryPi”](http://alexba.in/blog/2013/01/06/setting-up-lirc-on-the-raspberrypi/).

## Commands

### Get temperature

```shell
homepi-ac temperature
```

```shell
$ ./index.js temperature
80.96000000000001°F
```

### Manipulate AC

```shell
homepi-ac ac -d <lirc-device-name> <power|down|up|fan|timer|mode>
```

```shell
./index.js ac -d LG_AKB73016012 power
(beep beep!)
```

### HomeKit Server

```shell
homepi-ac server -d <lirc-device-name> -c <pin> -n [network-device-name] -s <serial-number> -p [port]
```

```shell
./index.js server -d LG_AKB73016012 -c 000-00-001 -s 000000000000
(beep beep!)
```

## Installation

```shell
$ git clone https://github.com/zwaldowski/homepi-ac.git
$ cd homepi-ac
# mkdir /var/lib/homekit
# npm install -g --prefix /var/lib/homekit
# useradd —system homekit
# usermod -a -G i2c homekit
# chown -R homekit /var/lib/homekit
# cp data/homepi-ac.defaults-linux /etc/default/homepi-ac
# nano /etc/default/homepi-ac
# cp data/homepi-ac.service-linux /etc/systemd/system/homepi-ac.service
# systemctl daemon-reload
# systemctl enable homepi-ac
# systemctl start homepi-ac
$ systemctl status homepi-ac
```

