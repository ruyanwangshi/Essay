const arr = [1,[2,[3,[4]]]]
console.time()
console.log(arr.flat(Infinity))
console.timeEnd()

function concatArr(list) {
    if(Array.isArray(list)) {
        return list.reduce((pre,cur) => {
            return pre.concat(Array.isArray(cur) ? concatArr(cur) : cur)
        }, [])
    } else {
       return []
    }
}
console.time()
console.log(concatArr(arr))
console.timeEnd()


const resArr = []
function newArr(list) {
    if(Array.isArray(list)) {
        list.forEach(item => {
            if(Array.isArray(item)) {
                newArr(item)
            } else {
                resArr.push(item)
            }
        })
    }
}
console.time()
newArr(arr)
console.log(resArr)
console.timeEnd()