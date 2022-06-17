// !Symbol.asyncIterator 内置异步生成器函数async 主要使用for-await-of来进行遍历

// class Foo {
//     async *[Symbol.asyncIterator]() {}
// }

// const f = new Foo();
// console.log(f[Symbol.asyncIterator]())

// class Emitter {
//     constructor(max) {
//         this.max = max;
//         this.asyncIdx = 0;
//     }
//     async *[Symbol.asyncIterator]() {
//         while(this.asyncIdx < this.max) {
//             yield new Promise((resolve) => resolve(this.asyncIdx++))
//         }
//     }
// }

// function asyncCount() {
//     const emitter = new Emitter(5);

//     return emitter
    
//     // for await(const x of emitter) {
//     //     console.log(x)
//     // }
// }

// const emitter = asyncCount();

// console.log(emitter[Symbol.asyncIterator]().next())


// !Symbol.match 主要使用String原型上的match方法

// class Foo{
//     static [Symbol.match](target = '') {
//         console.log(target, this)
//         return target.includes('foo')
//     }
// }

// const Bar = {
//     [Symbol.match](target) {
//         console.log('target', this)
//         return 123
//     }
// }

// class Bar {
//     constructor(str) {
//         this.str = str
//     }
//     [Symbol.match] (target) {
//         console.log(this)
//         return target.includes(this.str)
//     }
// }

// console.log('barfoo'.match(Foo))
// console.log('1'.match(Bar))
// console.log('testbar'.match(new Bar('test')))


// !Symbol.hasInstance 一个方法，该方法决定一个构造器对象是否认可一个对象是它的实例。由instanceof操作符使用。


// function Foo() {}
// const f = new Foo()
// console.log(f instanceof Foo)

// console.log(Foo[Symbol.hasInstance](f))

// class Bar{}
// class Baz extends Bar{
// class Baz{
//     static [Symbol.hasInstance](target) {
//         return false
//     }
// }

// const b = new Bar()
// console.log(Bar[Symbol.hasInstance](b))
// console.log(b instanceof Bar)
// const z = new Baz()
// console.log(Baz[Symbol.hasInstance](z))
// console.log(z instanceof Baz)

// !Symbol.isConcatSpreadable 这个操作符作为一个属性表示“一个布尔值，如果是true，则意味着对象应该用Array.prototype.concat()打平已有的数组元素”