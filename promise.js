// class MyPromise{
//     constructor
// }

// function myApply(objThis, arg=[]) {
//   const fn = this
//   objThis.fn = fn
//   const result = objThis.fn(...arg)
//   delete objThis.fn
//   return result
// }

// Function.prototype.myApply = myApply;

// const obj = {
//     name: '123'
// }

// function test () {
//     console.log(this.name)
// }

// console.log(test.myApply(obj, [1,2,3,4]))

const PROMISE_RESOLVE_PENDING = 'pending'
const PROMISE_RESOLVE_RESOLVED = 'resolved'
const PROMISE_RESOLVE_REJECT = 'reject'

class MyPromise {
  constructor(callback) {
    this.status = PROMISE_RESOLVE_PENDING
    this.reason = null
    this.value = null
    this.onResolve = []
    this.onReject = []
    const resolve = (value) => {
      if (this.status === PROMISE_RESOLVE_PENDING) {
        queueMicrotask(() => {
          if (this.status !== PROMISE_RESOLVE_PENDING) return
          this.status = PROMISE_RESOLVE_RESOLVED
          this.value = value
          this.onResolve.forEach((fn) => {
            fn(this.value)
          })
        })
      }
    }

    const reject = (reseson) => {
      if (this.status === PROMISE_RESOLVE_PENDING) {
        queueMicrotask(() => {
          if (this.status !== PROMISE_RESOLVE_PENDING) return
          this.status = PROMISE_RESOLVE_REJECT
          this.reseson = reseson
          this.onReject.forEach((fn) => {
            fn(this.reseson)
          })
        })
      }
    }

    callback(resolve, reject)
  }

  then(resolve, reject) {
    if (this.status === PROMISE_RESOLVE_RESOLVED) {
      resolve(this.value)
    }
    if (this.status === PROMISE_RESOLVE_REJECT) {
      reject(this.reseson)
    }
    if (this.status === PROMISE_RESOLVE_PENDING) {
        console.log('resolve=>', resolve)
        console.log('reject=>', reject)
      if (resolve && typeof resolve === 'function') this.onResolve.push(resolve)
      if (reject && typeof reject === 'function') this.onReject.push(reject)
    }
  }
}

const Pro = new MyPromise((resolve, reject) => {
  resolve(123)
  reject(456)
})

Pro.then(
  (res) => {
    console.log(res)
  },
  (err) => {
    console.log(err)
  }
)

Pro.then(
  (res) => {
    console.log(res)
  },
  (err) => {
    console.log(err)
  }
)

setTimeout(() => {
  Pro.then(
    (res) => {
      console.log(res)
    },
    (err) => {
      console.log(err)
    }
  )
}, 1000)
