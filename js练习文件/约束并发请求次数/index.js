function initPost(max, ...post) {
  const MAX_PORST = max
  const queue = post
  let count = 0
  function run() {
    if (count < MAX_PORST && queue.length) {
      count++
      let fn = queue.shift()
      fn(count).then(() => {
        if (count === MAX_PORST) {
          count = 0
          console.log('-----------线程池工作的线程已满----------')
        }
        run()
      })
      run()
    }
  }
  
  return {
    run: run,
    add(...arg) {
      queue.push(...arg)
    },
  }
}

function fn(value) {
  return new Promise((resolve) => {
    setTimeout(resolve, 2000)
  }).then(() => {
    console.log('对应请求', value)
  })
}

const post = initPost(3, fn, fn, fn, fn)
post.run()
