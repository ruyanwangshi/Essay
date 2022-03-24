function foo(val) {
  if (val === 0 || val === 1) {
    return val
  }
  return foo(val - 1) + foo(val - 2)
}

function fooArr(val) {
  const allVal = []
  function Foo(val) {
    console.log(val)
    if (val === 0 || val === 1) {
      return val
    }
    const preval = Foo(val - 1) + Foo(val - 2)
    // allVal.push(preval)
    
  }
  return Foo(val)
}

// console.log(foo(10))
console.log(fooArr(10))
