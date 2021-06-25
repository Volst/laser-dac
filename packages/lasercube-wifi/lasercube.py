#!/usr/bin/env python3

# This is a proof of concept for controlling a LaserCube
# (https://www.laseros.com) over the network. RUNNING THIS CODE WITH A REAL
# LASERCUBE CAN BE PHYSICALLY DANGEROUS. PLEASE BE CAREFUL, AND, IF IN DOUBT,
# USE THE SAFETY LENS!

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

CMD_PORT = 45457 #nodejs check
DATA_PORT = 45458 #nodejs check

CMD_GET_FULL_INFO = 0x77
CMD_ENABLE_BUFFER_SIZE_RESPONSE_ON_DATA = 0x78
CMD_SET_OUTPUT = 0x80
CMD_GET_RINGBUFFER_EMPTY_SAMPLE_COUNT = 0x8a
CMD_SAMPLE_DATA = 0xa9

cmd_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # nodejs check
cmd_sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1) #nodejs check
cmd_sock.bind(('0.0.0.0', CMD_PORT)) #nodejs check

data_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # todo in nodejs
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
            # TODO: is this the security challenge?
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
            pass
        elif msg[0] == CMD_GET_RINGBUFFER_EMPTY_SAMPLE_COUNT:
            self.remote_buf_free = struct.unpack('<xxH', msg)[0]
    def send_cmd(self, cmd):
        cmd_sock.sendto(bytes(cmd), (self.addr, CMD_PORT))
        cmd_sock.sendto(bytes(cmd), (self.addr, CMD_PORT))
    def main(self):
        rnum = 0
        frame_num = 0
        current_frame = None

        self.send_cmd([CMD_ENABLE_BUFFER_SIZE_RESPONSE_ON_DATA, 0x1])
        self.send_cmd([CMD_SET_OUTPUT, 0x1])
        while self.running:
            current_frame = self.gen_frame()
            while len(current_frame):
                if self.remote_buf_free < 5000:
                    time.sleep(100/self.info.dac_rate)
                    self.remote_buf_free += 100
                msg = bytes([CMD_SAMPLE_DATA, 0x00, rnum % 0xff, frame_num % 0xff])
                for point in current_frame[:140]:
                    msg += point
                    self.remote_buf_free -= 1
                data_sock.sendto(msg, (self.addr, DATA_PORT))
                rnum += 1
                del current_frame[:140]
            frame_num += 1
        self.send_cmd([CMD_ENABLE_BUFFER_SIZE_RESPONSE_ON_DATA, 0x0])
        self.send_cmd([CMD_SET_OUTPUT, 0x0])

def scanner():
    while True:
        cmd_sock.sendto(bytes([CMD_GET_FULL_INFO]), ('255.255.255.255', CMD_PORT))
        time.sleep(1)
        print("Scanning")
threading.Thread(target=scanner, daemon=True).start()

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

while True:
    try:
        for sock in select.select([cmd_sock, data_sock], [], [])[0]:
            msg, (addr, port) = sock.recvfrom(4096) # what is the nodejs alternative for this
            if addr not in known_lasers:
                if msg[0] == CMD_GET_FULL_INFO and len(msg) > 1:
                    print("Found laser on", addr)
                    known_lasers[addr] = LaserCube(addr, gen_frame)
                else:
                    print("Not found laser on", addr)
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
