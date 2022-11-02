import { effect, track, trigger, createProxy } from './effectFn'

const dataobj = {
  name: 'name名称',
  test: 'test属性名',
  flag: true,
  count: 0,
}

const data = createProxy(dataobj)



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
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true
      trigger(obj, 'value')
    },
  })

  const obj = {
    get value(): ReturnType<F> {
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

function watch(
  resoure: any,
  cb: (newValue: any, oldValue: any | undefined) => void,
  options: {
    immediate?: boolean
  } = {}
) {
  let newValue: any, oldValue: any
  let getter: any
  if (typeof resoure === 'function') {
    getter = resoure
  } else {
    getter = () => recursion(resoure)
  }

  const job = () => {
    newValue = effectFn()
    cb(newValue, oldValue)
    oldValue = newValue
  }

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      job()
    },
  })

  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}

function recursion<O extends any>(obj: O, listenStack = new Set()) {
  if (typeof obj !== 'object' && listenStack.has(obj)) {
    return obj
  }

  listenStack.add(obj)

  for (const key in obj) {
    recursion(obj[key], listenStack)
  }

  return obj
}

watch(
  () => data.count,
  (newValue, oldValue) => {
    console.log('count' in data)
  },
  {
    immediate: true,
  }
)

data.count++
