@laser-dac/ether-dream
@laser-dac/core
@laser-dac/simulator
@laser-dac/helios

```js
import { DAC } from '@laser-dac/core';
import { EtherDream } from '@laser-dac/ether-dream';
import { Simulator } from '@laser-dac/simulator';

const dac = new DAC();
dac.use(new Simulator());
if (process.env.DEVICE) {
  dac.use(new EtherDream());
}
dac.start();
dac.stream(scene, 30000);
```

- Make ether-dream package work
- Fix examples
- Update README
- Update package.json description/tags etc
- Publish
- Update Betekenaar
