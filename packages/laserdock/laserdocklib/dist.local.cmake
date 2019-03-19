# Uncomment this line to build Android version
# You should manually remove build dir and reopen CMake project from scratch after change this value
if(NOT DEFINED BUILD_ANDROID)
    set(BUILD_ANDROID OFF)
endif()

# Print commands
set(CMAKE_VERBOSE_MAKEFILE ON)

# Setup Android environment
if(BUILD_ANDROID)
    include(local.android.cmake)
endif()