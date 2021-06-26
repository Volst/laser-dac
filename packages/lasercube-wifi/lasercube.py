#!/usr/bin/env python3

# This is a proof of concept for controlling a LaserCube
# (https://www.laseros.com) over the network. RUNNING THIS CODE WITH A REAL
# LASERCUBE CAN BE PHYSICALLY DANGEROUS. PLEASE BE CAREFUL, AND, IF IN DOUBT,
# USE THE SAFETY LENS!

# Copyright 2021 Sidney San Martín
#
# Permission to use, copy, modify, and/or distribute this software for any
# purpose with or without fee is hereby granted.
#
# THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
# REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
# AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
# INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
# LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
# OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
# PERFORMANCE OF THIS SOFTWARE.

import collections
import math
import select
import socket
import struct
import threading
import time

# Based on information from:
# https://github.com/Wickedlasers/libLaserdockCore/blob/master/3rdparty/laserdocklib/src/LaserDockNetworkDevice.cpp

# The laser is listening on at least three UDP ports and responds to unicast
# and broadcast messages. This makes it possible to control multiple LaserCubes
# on the network individually or all as one (by sending messages to the
# broadcast address). However, controlling multiple cubes as one could make it
# trickier to manage backpressure (i.e. to keep track of how much buffer is
# free on each cube and adjust sending speed).
#
# Each port listens for and responds to different categories of messages, but
# the messages are in the same format.

# For "alive" messages (simple pings to check which lasers are on the network).
# This code currently just uses the GET_FULL_INFO command instead.
ALIVE_PORT = 45456

# For commands (get information from the laser, enable/disable output, set the
# ILDA point rate, etc.)
CMD_PORT = 45457

# For data, i.e. actual points to scan out with the laser.
DATA_PORT = 45458

# All commands are UDP messages where the first byte is the command ID and the
# remaining bytes (if any) are specific to the command. When sending data, be
# careful to keep each message small enough to fit inside the network's MTU;
# more on that below. Here are the commands used in this example:

# The laser responds with a bunch of status information; see below.
CMD_GET_FULL_INFO = 0x77

# Causes the laser to reply to data packets with the amount of free space left
# in the buffer.
CMD_ENABLE_BUFFER_SIZE_RESPONSE_ON_DATA = 0x78

# Enables/disables output. Second byte should be zero or one. In my experience,
# this doesn't actually disable output if you're still sending samples, but
# disabling output *is* necessary for the menu button on the back of the
# LaserCube to work.
CMD_SET_OUTPUT = 0x80

# The laser responds with a count of free space in the RX buffer.
CMD_GET_RINGBUFFER_EMPTY_SAMPLE_COUNT = 0x8a

# Sends a list of points to be scanned out. Must be sent to DATA_PORT. As far
# as I can tell, the second byte of the message is always 0x0, the third and
# fourth bytes are sequence numbers representing the message and frame, and the
# remainder of the message is a list of points. So, you can split a frame into
# as many messages as you want to stay within the network's MTU, but the
# sequence number needs to go up with each one (and wrap back to zero after
# 255). In other words, a message is structured like this:
#     { CMD_SAMPLE_DATA, 0x00, message_number, frame_number, x, y, r, g, b, x, y, r, g, b, ... }
# message_number should go up after every message and frame_number should go up
# after every complete "frame". Note: x, y, r, g, b are two bytes each, with a
# range of 0x0-0xfff (NOT 0x0-0xffff).
CMD_SAMPLE_DATA = 0xa9

cmd_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
cmd_sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
cmd_sock.bind(('0.0.0.0', CMD_PORT))

data_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
data_sock.bind(('0.0.0.0', DATA_PORT))

LaserInfo = collections.namedtuple('LaserInfo', [
    'model_name',
    'fw_major', 'fw_minor', 'output_enabled',
    'dac_rate', 'max_dac_rate',
    'rx_buffer_free', 'rx_buffer_size',
    'battery_percent', 'temperature', 'connection_type',
    'model_number', 'serial_number', 'ip_addr'])

known_lasers = {}

class LaserCube:
    def __init__(self, addr, gen_frame):
        self.addr = addr
        self.gen_frame = gen_frame
        self.info = None
        self.remote_buf_free = 0
        self.running = True
        threading.Thread(target=self.main).start()
    def stop(self):
        self.running = False
    def recv(self, msg):
        if msg[0] == CMD_GET_FULL_INFO:
            # Unpack all of the fields from the info packet. The below line
            # extracts everything from fw_major to model_number; the following
            # lines have handle the name, IP address, and serial number.
            fields = struct.unpack('<xxBB?5xIIxHHBBB11xB26x', msg)
            serial_number = struct.unpack('6B', msg[26:32])
            ip_addr = struct.unpack('4B', msg[32:36])
            name = msg[38:].split(b'\0', 1)[0].decode()
            info = LaserInfo(
                name,
                *fields,
                ':'.join('%02x' % i for i in serial_number),
                '.'.join(str(i) for i in ip_addr))
            if info != self.info:
                self.info = info
                self.remote_buf_free = info.rx_buffer_free
        elif msg[0] == CMD_ENABLE_BUFFER_SIZE_RESPONSE_ON_DATA:
            # The laser acknowledges this command but nothing is done with that
            # response. Could be useful to re-send commands in case they're
            # lost on a flaky network!
            pass
        elif msg[0] == CMD_GET_RINGBUFFER_EMPTY_SAMPLE_COUNT:
            self.remote_buf_free = struct.unpack('<xxH', msg)[0]

    # All commands are idempotent (i.e. can be sent multiple times without
    # causing unexpected behavior), so send them twice to increase chance
    # of delivery. "Twice" is arbitrary and not strictly necessary, one or
    # three times would be fine, too.
    def send_cmd(self, cmd):
        cmd_sock.sendto(bytes(cmd), (self.addr, CMD_PORT))
        cmd_sock.sendto(bytes(cmd), (self.addr, CMD_PORT))

    # This function is the "main loop" for communicating with a specific laser
    # and runs in a thread. It first enables output and buffer size responses,
    # then starts sending points, then, at exit, disables output and buffer
    # size responses.
    def main(self):
        message_num = 0
        frame_num = 0

        self.send_cmd([CMD_ENABLE_BUFFER_SIZE_RESPONSE_ON_DATA, 0x1])
        self.send_cmd([CMD_SET_OUTPUT, 0x1])
        while self.running:
            # Ask the caller for the next frame.
            current_frame = self.gen_frame()

            while len(current_frame):
                # If the remote buffer is already partially full, wait a bit.
                # When to wait determines your latency/stability tradeoff. The
                # more of the buffer you use, the more easily you'll deal with
                # network hiccups slowness but the farther you'll be scheduling
                # stuff ahead of real time. On my LaserCube, the buffer is 6000
                # points and 5000 (i.e. only trying to use the first 1000 slots
                # in the buffer) was chosen through trial and error as
                # providing good stable output but keeping latency around
                # 1/30s. Could definitely be adjusted, and should really be
                # based on self.info.rx_buffer_size. In any case, this block
                # regulates how fast we're sending points.
                if self.remote_buf_free < 5000:
                    time.sleep(100/self.info.dac_rate)
                    # Temporarily adjust remote_buf_free based on how much time
                    # has passed. Will be corrected later by incoming
                    # CMD_GET_RINGBUFFER_EMPTY_SAMPLE_COUNT messages.
                    self.remote_buf_free += 100

                msg = bytes([CMD_SAMPLE_DATA, 0x00, message_num % 0xff, frame_num % 0xff])

                # Limiting to 140 points per message keeps messages under 1500
                # bytes, which is a common network MTU.
                for point in current_frame[:140]:
                    msg += point
                    self.remote_buf_free -= 1
                data_sock.sendto(msg, (self.addr, DATA_PORT))
                message_num += 1
                del current_frame[:140]
            frame_num += 1
        self.send_cmd([CMD_ENABLE_BUFFER_SIZE_RESPONSE_ON_DATA, 0x0])
        self.send_cmd([CMD_SET_OUTPUT, 0x0])

# Broadcasts GET_FULL_INFO commands once per second. All lasers on the network
# will respond. Responses are handled below.
def scanner():
    while True:
        cmd_sock.sendto(bytes([CMD_GET_FULL_INFO]), ('255.255.255.255', CMD_PORT))
        time.sleep(1)
threading.Thread(target=scanner, daemon=True).start()

# This is just an example; makes a wavy rainbow circle.
def gen_frame():
    frame = []
    for i in range(256):
        p = float(i) / 256
        frame.append(struct.pack('<HHHHH',
            int(((math.sin(p * math.pi * 2)) * (0.8 + math.sin(p * 10 * math.pi * 2 + time.time()) * 0.1) * 0.7 / 2. + 0.5) * 0xfff),
            int(((math.cos(p * math.pi * 2)) * (0.8 + math.sin(p * 10 * math.pi * 2 + time.time()) * 0.1) * 0.7 / 2. + 0.5) * 0xfff),
            int(math.pow((math.sin((p + (time.time() * 1)) * (math.pi*4)) / 2. + 0.5), 1) * 0x20f),
            int(math.pow((math.sin((p + (time.time() * 2)) * (math.pi*4)) / 2. + 0.5), 1) * 0x0ff),
            int(math.pow((math.sin((p + (time.time() * 3)) * (math.pi*4)) / 2. + 0.5), 1) * 0x080)))
    return frame

# Loop over incoming messages on cmd_sock and data_sock, and route them to the
# right LaserCube objects (or allocate new ones as needed).
while True:
    try:
        for sock in select.select([cmd_sock, data_sock], [], [])[0]:
            msg, (addr, port) = sock.recvfrom(4096)
            if addr not in known_lasers:
                if msg[0] == CMD_GET_FULL_INFO and len(msg) > 1:
                    known_lasers[addr] = LaserCube(addr, gen_frame)
                else:
                    continue
            laser = known_lasers[addr]
            new = not laser.info
            laser.recv(msg)
            if new:
                print("Found:", laser.info)
    except KeyboardInterrupt:
        print()
        break

for addr, laser in known_lasers.items():
    laser.stop()
