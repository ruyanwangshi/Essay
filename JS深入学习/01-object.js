// const b = new Object()
// const set = new Set()

// console.log(Object.getOwnPropertyNames(b.__proto__))
// console.log(b.__proto__ === Object.prototype)
// console.log(b.__proto__)
// console.log(b.toLocaleString())
// console.log(set.toLocaleString())

// console.log()
/* class Foo {
    constructor() {
        this[Symbol.toStringTag] = 'Foo'
        console.log(this)
    }
}

const foo = new Foo()
console.log(foo.toString()) */

class Foo{}
const foo = new Foo()

// console.log(3+foo)
// console.log(3-foo)

class Bar{
    constructor() {
        this[Symbol.toPrimitive] = function(hint) {
            switch(hint) {
                case
            }
        }
    }
}