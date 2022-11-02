import { effect, createProxy } from './effectFn'

const obj = {
    a: 123,
    b: true
}

const data = createProxy(obj)


effect(() => {
    if(data) {
        console.log('a' in data)
    }
})


if(data?.a) {
    data.a++
    data.a++
    data.a++
    data.a++
}