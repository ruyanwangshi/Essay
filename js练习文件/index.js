// // for(const key in window) {
// //     document.write(`${key}\n`)
// // }

// // let num = 0

// // 使用标签标识然后使用break去中断嵌套层数很深的循环很有用 最终值为55
// // end: for(let i = 0; i<10; i+=1) {
// //     for(let j = 0; j<10; j+=1) {
// //         if(i === 5 && j === 5){
// //             break end
// //         }
// //         num ++
// //     }
// // }

// // 使用标签标识后使用continue会跳出一次内部循环 最终值为95
// // end: for(let i = 0; i<10; i+=1) {
// //     for(let j = 0; j<10; j+=1) {
// //         if(i === 5 && j === 5){
// //             continue end
// //         }
// //         num ++
// //     }
// // }
// // console.log(num)

// // console.log([] instanceof Array)
// // console.log({} instanceof Array)

// const arr = new Array(10).fill({
//   title: '空白内容',
// })

// initDom()

// function initDom() {
//   console.log(arr)
//   init()
//     .then((res) => {
//       res.forEach((item, index) => {
//         arr[index] = item
//       })
//     })
//     .finally(() => {
//       // 页面代码
//       arr.forEach((item) => {
//         const div = document.createElement('div')
//         div.innerText = item.title
//         document.documentElement.appendChild(div)
//       })
//     })
// }


// function init() {
//   return new Promise((e) =>
//     setTimeout(
//       () =>
//         e([
//           {
//             title: '测试1',
//           },
//           {
//             title: '测试2',
//           },
//         ]),
//       0
//     )
//   )
// }


// const res = {
//   name: 'string'
// }

const foo = [1,2,3]
// console.log(foo.toString())
// console.log(foo.valueOf())

console.log(foo.sort((item1,item2) => {
  console.log(item2, item1)
  return item1 - item2
}))
