// let index = 0
// const indexStack = []
// activatedIndex = 0
// function* depTree(list) {
//   while (index < list.length) {
//     const item = list[index]
//     index++
//     if (item.childrens) {
//       indexStack.push(index)
//       index = 0
//       yield* depTree(item.childrens)
//       index = indexStack[indexStack.length - 1]
//       indexStack.pop()
//     }
//     yield item.value
//   }
// }

const tree = [
  {
    value: 1,
    childrens: [
      {
        value: 3,
      },
      {
        value: 4,
      },
    ],
  },
  {
    value: 2,
    childrens: [
      {
        value: 5,
      },
      {
        value: 6,
      },
    ],
  },
]
function* foo(list) {
  for (let value of list) {
    if (value.childrens) yield* foo(value.childrens)
    yield value.value
  }
}

// function* spanTree(list) {
//   let stack = []
//   for (let item of list) {
//     if (item.childrens) stack = stack.concat(item.childrens)
//     yield item.value
//   }
//   if (stack.length) {
//     yield* spanTree(stack)
//   }
// }

// 深度优先快速队列
function * spanTree(list) {
    let item, curTree = [...list]
    while(item = curTree.shift()){
        item.childrens && curTree.unshift(...item.childrens)
        yield item.value
    }
}

// function* spanTree(list) {
//     let stack = []
//     for (let item of list) {
//       if (item.childrens) stack = stack.concat(item.childrens)
//       yield item.value
//     }
//     if (stack.length) {
//       yield* spanTree(stack)
//     }
//   }
  

// function * iterator(number) {
//     if(number > 0) {
//         yield * iterator(number - 1)
//         yield number - 1
//     }
// }

console.log(...spanTree(tree))

// for (value of depTree(tree)) {
//   console.log(value)
// }
