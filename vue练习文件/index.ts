const dataobj = {
  name: 'name名称',
  test: 'test属性名',
  flag: true,
  count: 0,
}

type Effect = {
  (): any
  deps: Array<Set<() => any>>
  scheduler?(effect?: () => any): any
}

const bucket = new WeakMap()
let activeEffect: Effect
const effectStack: Effect[] = []

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
})

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

function effct<F extends (...arg: any[]) => any>(
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

const stack: Set<() => any> = new Set()

let flush = false
function jobFn() {
  if (flush) return
  flush = true
  Promise.resolve()
    .then(() => {
      stack.forEach((fn) => fn())
    })
    .finally(() => {
      flush = false
    })
}

function computed<F extends () => any>(getter: F) {
  let value: any
  let dirty = true
  const effectFn = effct(getter, {
    lazy: true,
    scheduler() {
        dirty = true
        trigger(obj, 'value')
    },
  })

  const obj = {
    get value() {
      if (dirty) {
        dirty = false
        value = effectFn()
      }
      track(obj, 'value')
      return value
    },
  }
  return obj
}

const count = computed(() => data.count)

effct(() => {
  console.log('执行了副作用函数')
  console.log(count.value)
})

data.count++