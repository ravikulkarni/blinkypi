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

Then clone this repository and cd into blinkypi directory.

Then run the following command

```
npm install
```

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

## Running the blinkypi code

Use the command below to start the blinkypi

node blinkyserver.js
