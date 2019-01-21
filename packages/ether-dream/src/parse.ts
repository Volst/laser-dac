function parseUInt16(c0: number, c1: number) {
  return c1 * 256 + c0;
}

function parseUInt32(c0: number, c1: number, c2: number, c3: number) {
  return c3 * 256 * 256 * 256 + c2 * 256 * 256 + c1 * 256 + c0;
}

export function parseStandardResponse(data: number[]) {
  const response = String.fromCharCode(data[0]);
  const status = {
    protocol: data[2],
    light_engine_state: data[3],
    playback_state: data[4],
    source: data[5],
    light_engine_flags: parseUInt16(data[6], data[7]),
    playback_flags: parseUInt16(data[8], data[9]),
    source_flags: parseUInt16(data[10], data[11]),
    buffer_fullness: parseUInt16(data[12], data[13]),
    point_rate: parseUInt32(data[14], data[15], data[16], data[17]),
    point_count: parseUInt32(data[18], data[19], data[20], data[21])
  };
  const st = {
    // dac_response
    response,
    command: String.fromCharCode(data[1]),
    success: response == 'a',
    str:
      'resp=' +
      response +
      ',fullness=' +
      status.buffer_fullness +
      ',raw=' +
      data,
    // dac_status
    status
  };
  return st;
}

export function twohex(n: number) {
  let s = n.toString(16);
  if (s.length == 1) s = '0' + s;
  return s;
}
