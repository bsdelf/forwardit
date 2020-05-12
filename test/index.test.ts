import it from 'ava';
import {
  forward,
  installForwards,
  uninstallForwards,
  getForwards,
  clearForwards,
  Forward,
} from '../src';

class Box {
  @forward
  data: number;

  @forward
  @forward('increase')
  inc() {
    ++this.data;
  }

  @forward({
    name: 'count',
  })
  static count = 0;

  @forward
  static clearBox(box: Box) {
    box.data = 0;
  }

  nop() {}

  static nop() {}

  constructor(data: number = 0) {
    this.data = data;
  }
}

interface Context extends Pick<Box, 'data' | 'inc'> {
  increase(): void;
}

class Context {}

const comparator = (a: Forward, b: Forward) => {
  let n = a.key.localeCompare(b.key);
  if (n !== 0) {
    return n;
  }
  n = a.name.localeCompare(b.name);
  if (n !== 0) {
    return n;
  }
  if (a.bind !== b.bind) {
    if (!a.bind) {
      return -1;
    }
    if (!b.bind) {
      return 1;
    }
  }
  return 0;
};

const constructorExpected = [
  { key: 'count', name: 'count', bind: false },
  { key: 'clearBox', name: 'clearBox', bind: true },
].sort(comparator);

const prototypeExpected = [
  { key: 'data', name: 'data', bind: false },
  { key: 'inc', name: 'inc', bind: true },
  { key: 'inc', name: 'increase', bind: true },
].sort(comparator);

(() => {
  it('Should get forwards from constructor', (t) => {
    const forwards = getForwards(Box);
    if (!forward || !Array.isArray(forwards)) {
      t.fail('forwards is not array');
      return;
    }
    const actual = forwards.sort(comparator);
    t.deepEqual(actual, constructorExpected);
  });

  it('Should get forwards from prototype', (t) => {
    const box = new Box();
    const forwards = getForwards(box);
    if (!forward || !Array.isArray(forwards)) {
      t.fail('forwards is not array');
      return;
    }
    const actual = forwards.sort(comparator);
    t.deepEqual(actual, prototypeExpected);
  });

  it('Should clear forwards from constructor', (t) => {
    class A {
      @forward
      static data = 1;
    }
    t.truthy(getForwards(A));
    clearForwards(A);
    t.falsy(getForwards(A));
  });

  it('Should clear forwards from prototype', (t) => {
    class A {
      @forward
      data = 1;
    }
    t.truthy(getForwards(A.prototype));
    clearForwards(A.prototype);
    t.falsy(getForwards(A.prototype));
  });

  it('Should throw for duplicate properties', (t) => {
    const box = new Box();
    const context = { data: 1 };
    t.throws(() => {
      installForwards(context, box);
    });
  });

  it('Should install & uninstall forwards for instance of class', (t) => {
    const box = new Box();
    const context = new Context();

    installForwards(context, box);
    t.deepEqual(typeof context.data, 'number', 'install data');
    t.deepEqual(typeof context.inc, 'function', 'install inc');
    t.deepEqual(typeof context.increase, 'function', 'install increase');

    uninstallForwards(context, box);
    t.deepEqual(typeof context.data, 'undefined', 'uninstall data');
    t.deepEqual(typeof context.inc, 'undefined', 'uninstall inc');
    t.deepEqual(typeof context.increase, 'undefined', 'uninstall increase');
  });

  it('Should forward properties', (t) => {
    const box = new Box();
    const context = new Context();
    installForwards(context, box);

    t.deepEqual(context.data, box.data, 'initial data');
    box.inc();
    t.deepEqual(context.data, box.data, 'after increase #1');
    context.inc();
    t.deepEqual(context.data, box.data, 'after increase #2');
    context.increase();
    t.deepEqual(context.data, box.data, 'after increase #3');
  });
})();
