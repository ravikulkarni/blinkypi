## blinkypi

This project is to control Blinky Tape (http://blinkinlabs.com/blinkytape/) with Raspberry Pi

## Installing node.js on Raspberry Pi :
On Raspberry Pi shell, run the following commands one after another

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

exit out of shell and login again to get the new settings.

Then run the command below

npm install -g node-gyp 

## Installing blinkypi source code.

Install first git on raspberry pi using following command

sudo apt-get install git

Then clone this repository and cd into blinkypi directory.

Then run the following command

npm install

## Running the blinkypi code

Use the command below to start the blinkypi

node blinkyserver.js
