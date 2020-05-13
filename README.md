# forwardit

Forwarding marker and installer.

## Installation

```
npm i forwardit
```

## Usage

Basic usage in JavaScript:

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

broker.inc();
console.log(broker.value, data.value); // 1, 1

data.inc();
console.log(broker.value, data.value); // 2, 2

uninstallForwards(broker, data);
console.log(broker.value, data.value); // undefined, 2
```

For TypeScript, we need to argument broker's type information to avoid compiler errors and make code completion working correctly:

```typescript
// declare Broker as usual
class Broker {
  // Broker's own properties
}

// argument Broker with selected properties from Data
interface Broker extends Pick<Data, 'value' | 'inc'> {}

// create instances, install forwards...

// now code completion works for "value" and "inc", no more compiler errors
broker.value;
broker.inc;
```
