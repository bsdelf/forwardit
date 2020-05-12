# forwardit

Forwarding marker and installer.

## Usage

```javascript
const { forward, installForwards, uninstallForwards } = require('forwardit');

class Data {
  @forward
  value = 0;

  @forward
  inc() {
    this.value++;
  }
}

const data = new Data();
const broker = {};

installForwards(broker, data);
console.log(broker.value, data.value); // 0, 0

data.inc();
console.log(broker.value, data.value); // 1, 1

data.inc();
console.log(broker.value, data.value); // 2, 2

uninstallForwards(broker, data);
console.log(broker.value, data.value); // undefined, 2
```
