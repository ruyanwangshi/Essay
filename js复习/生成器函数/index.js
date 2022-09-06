// 生成器函数执行内部一系列状态
// function * func() {
//     const res1 = yield 'hello'
//     console.log(res1)
//     const res2 = yield 'world'
//     console.log(res2)
//     return '测试'
// }

// const funciterator = func()

// console.log(funciterator.next(1)) // { value: 'hello', done: false }
// console.log(funciterator.next(2)) // { value: 'world', done: false }
// console.log(funciterator.next()) // { value: '测试', done: true }



// function * func(option) {
//     const res = yield * foo(option)
//     yield res
// }

// console.log(foo(1))

// console.log(...func({}))

function * foo(callback) {
    yield
}

const fooLazy = foo((msg) => {
    console.log(msg)
})

function bar() {
    setTimeout(() =>{
        fooLazy.next()
    }, 1000)
}

bar()