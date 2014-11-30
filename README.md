# blinkypi

Imagine you want to have visual indicators in your team area that could be seen from all sides. There is no space and budget to buy those many TVs, or you have a large TV and need continuous indication of status from anywhere in the room. Your team is responsible for multiple projects and has more than one Jenkin jobs. What do you do?

You use our project "Blinky Pi". It costs just over $100 to build. The project uses blinky tape (http://blinkinlabs.com/blinkytape) and Raspberry Pi (http://www.raspberrypi.org) to create a visual indicator that can show you current status of Jenkin jobs. 

A node server is running on Raspberry Pi which controls the individual LEDs on the Blinky tape. 

# Installation Instructions

## Installing node.js on Raspberry Pi :
On Raspberry Pi shell, run the following commands one after another

```
sudo apt-get update
sudo apt-get upgrade
sudo su -
cd /opt
wget http://nodejs.org/dist/v0.10.25/node-v0.10.25-linux-arm-pi.tar.gz
tar xvzf node-v0.10.25-linux-arm-pi.tar.gz
ln -s node-v0.10.25-linux-arm-pi node
chmod a+rw /opt/node/lib/node_modules
chmod a+rw /opt/node/bin
echo 'PATH=$PATH:/opt/node/bin' > /etc/profile.d/node.sh
```

exit out of shell and login again to get the new settings.

Then run the command below

```
npm install -g node-gyp 
```

## Installing blinkypi source code.

Install first git on raspberry pi using following command

```
sudo apt-get install git
```

Then clone this repository.


## Installing WiringPi on Raspberry Pi

Use the following command to install

```
git clone git://git.drogon.net/wiringPi
cd wiringPi
./build
```

Use the following command to test

```
gpio -v
gpio readall
```

## Setting up Raspberry Pi to auto start Blinkypi server on boot.

Add the following lines to /etc/rc.local file on the Raspberry Pi
```
printf "Starting Blinkypi Server"
su pi -c '/opt/node/bin/node /path/to/blinkypiserver.js >/tmp/blinkypiserver.out 2>&1'
```

## Running the blinkypi code from shell

Use the command below to start the blinkypi 

```
cd blinkypi
node blinkypiserver.js
```

## Indicators and Button on Pibrella board.
**Red Button:** Pressing this button lights up all 3 indicators and then reboots the Raspberry Pi 

**Red:** Error when execution. Reboot the Raspberry Pi using the red button.

**Green:** Blinky pi server started and ready to receive requests.

**Blinking Amber:** http request received and processed. 

## Usage
Control individual LEDs on Blinkytape using http request in format below

```
curl --GET "http://raspberrypi-ip-address:8080?color=<color>&startled=<start-led-no>&count=<count>"
```

The LEDs are numbered from 0 to 59

Colors allowed are "green", "red", "blue", "amber"

Count includes the starting LED number. For example, if the <count> is 1, then the LED at <start-led-no> will be turned on.
