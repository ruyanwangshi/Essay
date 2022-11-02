type Effect = {
  (): any
  deps: Array<Set<() => any>>
  scheduler?(effect?: () => any): any
}

const bucket = new WeakMap()
let activeEffect: Effect
const effectStack: Effect[] = []

function createProxy<O>(dataobj: O): O | undefined {
  if (typeof dataobj === 'object' && dataobj !== null) {
    const data = new Proxy(dataobj, {
      get(target: any, key: string) {
        track(target, key)
        return target[key]
      },
      set(target: any, key: string, value: any) {
        target[key] = value
        trigger(target, key)
        return true
      },
      has(target: any, key: string | symbol) {
        console.log('target[key]=>', target[key])
        return true
      }
    })
    return data
  }
}

function track<T extends object, K = string>(target: T, key: K) {
  if (!activeEffect) {
    return
  }
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)

  activeEffect.deps.push(deps)
}

function trigger<T extends object, K = string>(target: T, key: K) {
  const depsMap = bucket.get(target)
  if (!depsMap) {
    return
  }
  const deps: Set<Effect> = depsMap.get(key)
  const effctFn: Set<Effect> = new Set()
  deps.forEach((fn) => {
    if (fn !== activeEffect) {
      effctFn.add(fn)
    }
  })
  effctFn &&
    effctFn.forEach((fn: Effect) => {
      if (fn?.scheduler) {
        fn.scheduler(fn)
      } else {
        fn()
      }
    })
}

function effect<F extends (...arg: any[]) => any>(
  fn: F,
  options?: {
    scheduler?: (effect?: () => any) => void
    lazy?: boolean
  }
) {
  const effctFn: Effect = () => {
    cleanup(effctFn)
    activeEffect = effctFn
    effectStack.push(activeEffect)
    const res = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }
  if (options?.scheduler) {
    effctFn.scheduler = options.scheduler
  }
  effctFn.deps = []
  if (!options?.lazy) {
    effctFn()
  }

  return effctFn
}

function cleanup(effctFn: Effect) {
  const deps: Array<Set<() => any>> = effctFn.deps
  {
    let item: Set<() => any>
    for (item of deps) {
      item.delete(activeEffect)
    }
    effctFn.deps.length = 0
  }
}

export { effect, createProxy, track, trigger }
