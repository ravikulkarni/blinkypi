#!/bin/bash

# This script will cycle through all the leds with red, green and blue color.

for j in `seq 0 1`;
do
    for i in `seq 0 59`;
    do
	echo "http://raspberrypi:8080?color=red&startled=$i&count=1"
	curl --GET "http://raspberrypi:8080?color=red&startled=$i&count=1"
	sleep 1s
    done 
    
    for i in `seq 0 59`;
    do
	echo "http://raspberrypi:8080?color=green&startled=$i&count=1"
	curl --GET "http://raspberrypi:8080?color=green&startled=$i&count=1"
	sleep 1s
    done 
    
    for i in `seq 0 59`;
    do
	echo "http://raspberrypi:8080?color=blue&startled=$i&count=1"
	curl --GET "http://raspberrypi:8080?color=blue&startled=$i&count=1"
	sleep 1s
    done 
done
