// 输入: ["janus"，"boys"，"toys ] ，输出:"s
// 输入: ['medicine""racecar'，"car"] ，输出: 11
// 输入: ['national"，"arrival"，"mental ] ，输出:"al

function foo(arr) {
  // let str = []
  let str = ''
  let key = ''
  const maxL = Math.max(...arr.map((item) => item.length))
  let index = 0
  // let first = 'left'
  for (let i = 0; i < maxL; i++) {
    const obj = {}
    for (const item of arr) {
      // if (first === 'right') {
      //   index = item.length - i
      // } else {
        index = i
      // }
      if (item[index]) {
        if (obj[item[index]]) {
          obj[item[index]] += 1
        } else {
          key = item[index]
          obj[item[index]] = 1
        }
      }
    }
    // if (obj[key] !== arr.length) {
    //   if (i === 0) {
    //     first = 'right'
    //   } else {
    //     return str.join('')
    //   }
    // } else if (obj[key] === arr.length) {
    //   if (first === 'right') {
    //     str.unshift(key)
    //   } else {
    //     str.push(key)
    //   }
    // }

    if (obj[key] === arr.length) {
      str += key
      // if (first === 'right') {
      //   str.unshift(key)
      // } else {
      //   str.push(key)
      // }
    } else {
      return str
    }
  }
  // return str.join('')
  return str
}


// let str = []
//   let key = ''
//   const maxL = Math.max(...arr.map((item) => item.length))
//   let index = 0
//   let first = 'left'
//   for (let i = 0; i < maxL; i++) {
//     const obj = {}
//     for (const item of arr) {
//       if (first === 'right') {
//         index = item.length - i
//       } else {
//         index = i
//       }
//       if (item[index]) {
//         if (obj[item[index]]) {
//           obj[item[index]] += 1
//         } else {
//           key = item[index]
//           obj[item[index]] = 1
//         }
//       }
//     }
//     if (obj[key] !== arr.length) {
//       if (i === 0) {
//         first = 'right'
//       } else {
//         return str.join('')
//       }
//     } else if (obj[key] === arr.length) {
//       if (first === 'right') {
//         str.unshift(key)
//       } else {
//         str.push(key)
//       }
//     }
//   }
//   return str.join('')

// console.log(foo(["ca","a"]))
console.log(foo(['cir', 'car']))
// console.log(foo(['national', 'arrival', 'mental']))
// console.log(foo(['flower', 'flow', 'flight']))
// console.log(foo(['medicine', 'racecar', 'car']))
