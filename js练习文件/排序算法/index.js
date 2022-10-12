// const arr = [4, 3, 2, 1]

// 冒泡排序
// function mySort(list) {
//   if (Array.isArray(list)) {
//     for (let i = list.length; i > 0; i--) {
//       for (let j = 0; j < list.length; j++) {
//         const nextItem = list[j + 1]
//         if (list[j] > nextItem) {
//           list[j + 1] = list[j]
//           list[j] = nextItem
//         }
//       }
//     }
//   }
//   return list
// }

// 选择性排序
// function mySort(list) {
//     if(Array.isArray(list)) {
//         for(let i = 0; i < list.length; i++) {
//             let item = list[i]
//             let index = i
//             for(let j = i; j < list.length; j++) {
//                 if(item > list[j]) {
//                     item = list[j]
//                     index = j
//                 }
//             }
//             list[index] = list[i]
//             list[i] = item
//         }
//     }
//     return list
// }

// 冒泡排序
// function mySort(arr) {
//   let changeSort = false
//   let index = 0
//   if (Array.isArray(arr)) {
//     for (let i = 0; i < arr.length; i++) {
//       for (let j = i + 1; j < arr.length; j++) {
//         index++
//         if (arr[i] > arr[j]) {
//           const pre = arr[i]
//           arr[i] = arr[j]
//           arr[j] = pre
//           changeSort = true
//         }
//       }
//       if (!changeSort) {
//         return
//       }
//     }
//     console.log('index=>', index)
//     return arr
//   }
// }

// function mySort(arr) {
//   if (Array.isArray(arr)) {
//     let len = arr.length
//     let index = 0
//     let changeFlag = false
//     while (len-- > 0) {
//         let minIndex = index
//         for (let i = index + 1; i < arr.length; i++) {
//            if(arr[minIndex] > arr[i]) {
//             minIndex = i
//             changeFlag = true
//            }
//         }
//         if(minIndex !== index) {
//           const pre = arr[minIndex]
//           arr[minIndex] = arr[index]
//           arr[index] = pre
//         }
//         index++
//     };
//     return arr
//   }
// }

// console.log(mySort(arr))

// console.log(mySort([4, 3, 2, 1]))

// console.time()
// console.log(mySort(arr))
// console.timeEnd()

// console.time()
// console.log(arr.sort((a,b) => a - b));
// console.timeEnd()

// function asyncAdd(a, b, cb) {
//   setTimeout(() => {
//     cb(null, a + b)
//   }, Math.random() * 1000)
// }

// async function total() {
//   const res1 = await sum(1, 2, 3, 4, 5, 6)
//   const res2 = await sum(1, 2, 3)
//   return [res1, res2]
// }
// console.time()
// total().then((res) => {
//   console.log(res)
//   console.timeEnd()
// })

// async function sum(...arg) {
//   // let sumValue
//   // let count
//   // let index = 0

//   const newObj = {}
//   let i = 0
//   let res
//   if (Array.isArray(arg)) {
//     while (i < arg.length) {
//       const value = arg[i]
//       newObj[value] = arg[++i] || 0
//       i++
//     }
//     const task = []
//     // console.log(newObj)
//     for (const item in newObj) {
//       // console.log(item, newObj[item])
//       task.push(() => {
//         return new Promise((resolve) => {
//           asyncAdd(+item, newObj[item], (_, res) => {
//             resolve(res)
//           })
//         })
//       })
//     }
//     res = await Promise.all(task.map((fn) => fn())).then((res) => {
//       if(res.length > 1) {
//         return sum(...res)
//       } else {
//         return res[0]
//       }
//     })
//   }

//   // return res
//   while (index < arg.length) {
//     if (!sumValue) {
//       sumValue = arg[index++]
//     }
//     count = arg[index++]
//     await new Promise((resolve) => {
//       asyncAdd(sumValue, count, (voidValue, res) => {
//         sumValue = res
//         resolve()
//       })
//     })
//   }
//   return sumValue
// }

// 插入排序

function mySort(list) {
  if (Array.isArray(list)) {
    let item
    for (let i = 1; i < list.length; i++) {
      item = list[i]
      let index = i
      for (let j = i - 1; j >= 0; j--) {
        if (item < list[j]) {
          console.log(list[j])
          list[index] = list[j]
          index = j
        }
        
      }

      list[index] = item

    }
    return list
  }
}

console.log(mySort([4,3,2,1]))
