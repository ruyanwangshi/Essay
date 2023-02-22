const list = new Array(9).fill(0).map((_, index) => `${index}${index}${index}`)
console.log(list)
const activeOptions = {
  x: 0,
  y: 0,
}

const root = document.getElementById('root')

render(root)

function createDom(vnode, root) {
  const dom = document.createElement(vnode.type)

  if (vnode.props) {
    for (const key in vnode.props) {
        console.log('key',key)
      if (/^on/.test(key)) {
        dom.addEventListener(key.match(/[^on](.)*/g)[0].toLowerCase(), vnode.props[key])
      }
    }
  }
  if (Array.isArray(vnode.children)) {
    vnode.children.forEach((element) => {
      createDom(element, dom)
    })
  } else {
    dom.innerHTML = vnode.children
  }
  console.log(root)
  root.appendChild(dom)
  return dom
}

function render(root) {
  const nodes = list.map((item) => ({
    type: 'div',
    props: {
      onPointerMove(e) {
        console.log(e)
      },
      onClick(e) {
        console.log(1111111)
      }
    },
    children: item,
  }))
  createDom(
    {
      type: 'div',
      children: nodes,
    },
    root
  )
}
