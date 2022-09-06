function* iterator(n) {
  if (n > 0) {
    yield* iterator(n - 1)
    yield n
  }
}

for(value of iterator(3)) {
    console.log('value:', value)
}

const tree = [
    {
        value: 1,
        childrens: [
            {
                value: 2,
                childrens: [
                    {
                        value: 4
                    }
                ]
            },
            {
                value: 3,
                childrens: [
                    {
                        value: 5
                    }
                ]
            }
        ]
    }
]

function * depTree(list) {
    let index = 0
    if(list[index].childrens?.length) {
        index ++
        yield * depTree(tree.childrens, index)
        yield list[index]
    }
}

for(value of depTree(tree)) {
    console.log(value)
}
