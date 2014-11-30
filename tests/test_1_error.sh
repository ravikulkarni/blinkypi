#!/bin/bash

# Run this script. The red indicator of the pibrella board will light up
# Press the red button to restart the raspberry pi.
#

for i in `seq 0 59`;
do
    echo "http://raspberrypi:8080?color=red&startled=$i&count=1"
    curl --GET "http://raspberrypi:8080?color=red&startled=$i&count=1"
done 
