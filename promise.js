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

    const reject = (reason) => {
      if (this.status === PROMISE_RESOLVE_PENDING) {
        queueMicrotask(() => {
          if (this.status !== PROMISE_RESOLVE_PENDING) return
          this.status = PROMISE_RESOLVE_REJECT
          this.reason = reason
          this.onReject.forEach((fn) => {
            fn(this.reason)
          })
        })
      }
    }

    callback(resolve, reject)
  }

  then(onResolve, onReject) {
    
    return new MyPromise((resolve, reject) => {
      onResolve = onResolve ?? ((res) => { resolve(res) })
      onReject = onReject ?? ((err) => { reject(err) })
      if (this.status === PROMISE_RESOLVE_RESOLVED) {
        try {
          const res = onResolve(this.value)
          resolve(res)
        } catch (e) {
          reject(e)
        }
      }
      if (this.status === PROMISE_RESOLVE_REJECT) {
        try {
          const err = onReject(this.reason)
          resolve(err)
        } catch (e) {
          reject(e)
        }
      }
      if (this.status === PROMISE_RESOLVE_PENDING) {
        if (resolve && typeof resolve === 'function')
          this.onResolve.push((res) => {
            try {
              const result = onResolve(res)
              resolve(result)
            } catch (e) {
              reject(e)
            }
          })
        if (reject && typeof reject === 'function')
          this.onReject.push((err) => {
            try {
              const error = onReject(err)
              resolve(error)
            } catch (e) {
              reject(e)
            }
          })
      }
    })
  }
}

const Pro = new MyPromise((resolve, reject) => {
  resolve(123)
  reject(456)
})

Pro.then(
  (res) => {
    console.log(aaa)
  },
  (err) => {
    console.log('err=>', err)
    return 'err message'
  }
)
  .then((res) => {
    console.log('res1=>', res)
  })
  .then(void 0, (err) => {
    console.log('err: 3', err)
  })

// Pro.then(
//   (res) => {
//     console.log('res2=>', res)
//   },
//   (err) => {
//     console.log('err=>', err)
//   }
// )

// setTimeout(() => {
//   Pro.then(
//     (res) => {
//       console.log(res)
//     },
//     (err) => {
//       console.log(err)
//     }
//   )
// }, 1000)
