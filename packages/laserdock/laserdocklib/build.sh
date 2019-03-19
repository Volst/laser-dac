set -e

cd lib
g++ -Wall -std=c++14 -fPIC -O2 -c LaserdockDeviceManager.cpp
g++ -Wall -std=c++14 -fPIC -O2 -c LaserdockDeviceManager_desktop.cpp
g++ -Wall -std=c++14 -fPIC -O2 -c LaserdockDevice.cpp
g++ -Wall -std=c++14 -fPIC -O2 -c LaserdockDevice_desktop.cpp
g++ -Wall -std=c++14 -fPIC -O2 -c LaserdockNode.cpp


g++ -shared -o liblaserdock.dylib LaserdockDevice.o LaserdockDeviceManager.o LaserdockDeviceManager_desktop.o  LaserdockDevice_desktop.o LaserdockNode.o libusb-1.0.0.dylib

echo Success