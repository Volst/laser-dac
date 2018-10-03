import * as dgram from 'dgram';
import { EtherConn, StreamSourceFn } from './EtherConn';
import { twohex } from './parse';

export interface IDevice {
  ip: string;
  port: number;
  name: string;
  hw_revision: number;
  sw_revision: number;
}

export class EtherDream {
  static _find = function(limit: number, timeout: number): Promise<IDevice[]> {
    const ips: string[] = [];
    const devices: IDevice[] = [];

    const server = dgram.createSocket('udp4');

    return new Promise(resolve => {
      const timeouttimer = setTimeout(function() {
        server.close();
        resolve(devices);
      }, timeout);

      server.on('message', function(msg, rinfo) {
        const ip = rinfo.address;
        if (ips.indexOf(ip) != -1) return;
        ips.push(ip);

        const name =
          'EtherDream @ ' +
          twohex(msg[0]) +
          ':' +
          twohex(msg[1]) +
          ':' +
          twohex(msg[2]) +
          ':' +
          twohex(msg[3]) +
          ':' +
          twohex(msg[4]) +
          ':' +
          twohex(msg[5]);

        devices.push({
          ip: ip,
          port: 7765,
          name: name,
          hw_revision: msg[6],
          sw_revision: msg[7]
        });

        if (devices.length >= limit) {
          server.close();
          clearTimeout(timeouttimer);
          resolve(devices);
        }
      });

      server.bind(7654);

      // wait two seconds for data to come back...
    });
  };

  static find = function() {
    return EtherDream._find(99, 2000);
  };

  static findFirst = function() {
    return EtherDream._find(1, 4000);
  };

  static connect = function(ip: string, port: number) {
    const conn = new EtherConn();
    return conn
      .connect(
        ip,
        port
      )
      .then(success => (success ? conn : null));
  };
}

export { EtherConn, StreamSourceFn };
