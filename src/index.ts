import 'reflect-metadata';

const FORWARDS_ID = 'forwardit:forwards';

export interface Forward {
  /**
   * Property name.
   */
  key: string;

  /**
   * Optional new name for the property.
   */
  name: string;

  /**
   * Whether "this" should be bound for this property.
   */
  bind: boolean;
}

export type ForwardOptions = Omit<Partial<Forward>, 'key'>;

/**
 * Add forward for property.
 * @param name New name for the property.
 */
export function forward(name: string): Function;
export function forward(options: ForwardOptions): Function;
export function forward(target: any, key: string): void;
export function forward(...args: any[]): Function | void {
  const makeDecorator = (options: ForwardOptions = {}) => {
    return (target: any, key: string) => {
      const name = options.name || key;
      const bind =
        options.bind !== undefined
          ? options.bind
          : Object.hasOwnProperty.call(target, key) && typeof target[key] === 'function';
      const forwards: Forward[] = Reflect.getOwnMetadata(FORWARDS_ID, target) || [];
      forwards.push({ key, name, bind });
      Reflect.defineMetadata(FORWARDS_ID, forwards, target);
    };
  };
  if (args.length === 1) {
    const options = typeof args[0] === 'string' ? { name: args[0] } : args[0];
    return makeDecorator(options);
  } else {
    makeDecorator()(...(args as [any, string]));
  }
}

/**
 * Install forwards in target.
 * @param target A target where forwards to be installed in.
 * @param source A constructor or instance of class which has forward declarations.
 */
export function installForwards(target: any, source: any) {
  const forwards: Forward[] = Reflect.getMetadata(FORWARDS_ID, source) || [];
  for (const forward of forwards) {
    const name = forward.name;
    if (name in target) {
      throw new Error(`Property "${name}" already exists in target`);
    }
    let get: () => void;
    if (forward.bind) {
      const method = source[forward.key].bind(source);
      get = () => method;
    } else {
      get = () => source[forward.key];
    }
    Object.defineProperty(target, name, {
      enumerable: true,
      configurable: true,
      get,
    });
  }
}

/**
 * Uninstall forwards in target.
 * @param target A target where forwards are installed in.
 * @param source A constructor or instance of class which has forward declarations.
 */
export function uninstallForwards(target: any, source: any) {
  const forwards: Forward[] = Reflect.getMetadata(FORWARDS_ID, source) || [];
  for (const forward of forwards) {
    delete target[forward.name];
  }
}

/**
 * Get forward marks from constructor or instance of class.
 * @param source A constructor or instance of class which has forward declarations.
 * @returns An array of forward items if available.
 */
export function getForwards(source: any): Forward[] | undefined {
  return Reflect.getMetadata(FORWARDS_ID, source);
}

/**
 * Clear forward marks from constructor or instance of class.
 * @param source A constructor or an instance of class which has forward declarations.
 */
export function clearForwards(source: any) {
  Reflect.deleteMetadata(FORWARDS_ID, source);
}
