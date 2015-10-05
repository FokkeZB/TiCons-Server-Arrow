#!/bin/bash
echo "---"
echo "Start installing some tools..."
echo "(This bash script is run at npm preinstall.)"
echo "---"
apt-get update
apt-get install -qq zip
echo "---"
echo "done installing additional tools!"
echo "---"