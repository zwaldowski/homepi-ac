# HomePi AC

Investigation into the use of [ANAVI Infrared pHAT](http://anavi.technology/#products) to bridge a “dumb” air conditioner into HomeKit.

This code has been ported into the much more extensible [Homebridge](https://github.com/nfarina/homebridge) as the plugin [`homebridge-anavi-infrared-aircon`](https://github.com/zwaldowski/homebridge-anavi-infrared-aircon). Prefer its use instead.

This server was designed and tested on [Raspberry Pi Zero W](https://www.raspberrypi.org/products/raspberry-pi-zero-w/).

## Dependencies

- Install packages. For Raspbian Stretch:

```shell
# apt install nodejs-legacy npm lirc i2c-tools libavahi-compat-libdnssd-dev
```

- Enable I2C
- Enable LIRC module overlay. Update `/etc/lirc/lirc_options.conf` and `/etc/lirc/hardware.conf`.
- Reboot
- Create LIRC configuration

### Further reading

- [“Setting Up LIRC on the RaspberryPi”](http://alexba.in/blog/2013/01/06/setting-up-lirc-on-the-raspberrypi/)
- [“LIRC - Configuration guide”](http://www.lirc.org/html/configuration-guide.html)
- [“LIRC - `irrecord` manual”](http://www.lirc.org/html/irrecord.html)

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
# useradd —-system homekit
# usermod -a -G i2c homekit
# chown -R homekit /var/lib/homekit
# cp data/etc-default-homepi-ac.defaults-sample /etc/default/homepi-ac
# nano /etc/default/homepi-ac
# cp data/etc-systemd-system-homepi-ac.service-sample /etc/systemd/system/homepi-ac.service
# systemctl daemon-reload
# systemctl enable homepi-ac
# systemctl start homepi-ac
$ systemctl status homepi-ac
```

