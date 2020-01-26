#pragma once

#include "LaserdockDeviceManager.h"
#include "LaserdockDevice.h"

#if defined(WIN32) || defined(_WIN32) || defined(__WIN32) && !defined(__CYGWIN__)
	#define LASERDOCKNODE_EXPORT extern "C" __declspec (dllexport)
#else
	#define LASERDOCKNODE_EXPORT extern "C"
#endif

#define ERROR_NOT_INITIALIZED	-1

LaserdockDevice* device;

LASERDOCKNODE_EXPORT int nodeInit();
LASERDOCKNODE_EXPORT int nodeForceInit();
LASERDOCKNODE_EXPORT int nodeEnableOutput();
LASERDOCKNODE_EXPORT int nodeDisableOutput();
LASERDOCKNODE_EXPORT int nodeSetDacRate(uint32_t rate);
LASERDOCKNODE_EXPORT int nodeClearRingbuffer();
LASERDOCKNODE_EXPORT int nodeSendSamples(LaserdockSample *samples, uint32_t count);
