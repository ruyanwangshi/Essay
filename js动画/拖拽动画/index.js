// 开始排序逻辑
class Draggable {
  isPointerDown = false
  containerElement = null
  drag = { element: null }
  clone = { element: null }
  diff = { x: 0, y: 0 }
  lastPointerMove = { x: 0, y: 0 }
  rectList = []

  constructor(options) {
    this.containerElement = options.element
    console.log(this.containerElement)
    this.init()
  }
  init() {
    this.bindEventListenter()
    this.getReactList()
  }
  getReactList() {
    this.rectList.length = 0
    for (const item of this.containerElement.children) {
        console.log(item)
      this.rectList.push(item.getBoundingClientRect())
    }
  }
  onPointerDown(e) {
    this.drag.element = e.target
    this.drag.element.classList.add('active')

    const clone = this.drag.element.cloneNode(true)
    this.clone.element = clone
    document.body.appendChild(clone)
    const index = [].indexOf.call(this.containerElement.children, this.drag.element)
    this.drag.index = index
    this.drag.firstIndex = index

    this.clone.x = this.rectList[index].left
    this.clone.y = this.rectList[index].top

    clone.style.transition = 'none'

    clone.className = 'clone-item'
    clone.style.transform = `translate3d(${this.clone.x}px,${this.clone.y}px, 0)`

    this.isPointerDown = true

    this.lastPointerMove.x = e.clientX
    this.lastPointerMove.y = e.clientY

    console.log('最终dom结果', clone, this.clone.element)
  }
  onPointerMove(e) {
    if (this.isPointerDown) {
      this.diff.x = e.clientX - this.lastPointerMove.x
      this.diff.y = e.clientY - this.lastPointerMove.y
        console.log(e)
      Object.assign(this.lastPointerMove, {
        x: e.clientX,
        y: e.clientY,
      })

      Object.assign(this.clone, {
        x: this.clone.x + this.diff.x,
        y: this.clone.y + this.diff.y,
      })
      console.log(this.clone)
      this.clone.element.style.transform = `translate3d(${this.clone.x}px,${this.clone.y}px, 0)`
    }
  }
  onPointerUp(e) {
    // this.clone.element.remove()
    // this.clone = { element: null }
  }
  bindEventListenter() {
    // 事件绑定在父组件上面，性能更好，这种方式叫做事件代理
    this.containerElement.addEventListener('pointerdown', this.onPointerDown.bind(this))
    this.containerElement.addEventListener('pointermove', this.onPointerMove.bind(this))
    this.containerElement.addEventListener('pointerup', this.onPointerUp.bind(this))
  }
}

new Draggable({
  element: document.getElementById('root'),
})

// const list = new Array(9).fill(0).map((_, index) => `${index}${index}${index}`)
// console.log(list)
// const activeOptions = {
//   x: 0,
//   y: 0,
// }

// const root = document.getElementById('root')

// render(root)

// function createDom(vnode, root) {
//   const dom = document.createElement(vnode.type)

//   if (vnode.props) {
//     for (const key in vnode.props) {
//         console.log('key',key)
//       if (/^on/.test(key)) {
//         dom.addEventListener(key.match(/[^on](.)*/g)[0].toLowerCase(), vnode.props[key])
//       } else if(key === 'class'){
//         dom.className = vnode.props[key]
//       }
//     }
//   }
//   if (Array.isArray(vnode.children)) {
//     vnode.children.forEach((element) => {
//       createDom(element, dom)
//     })
//   } else {
//     dom.innerHTML = vnode.children
//   }
//   root.appendChild(dom)
//   return dom
// }

// function render(root) {
//   const nodes = list.map((item) => ({
//     type: 'div',
//     props: {
//       onPointerMove(e) {
//       },
//       onClick(e) {
//       },
//       class: 'box-item'
//     },
//     children: item,
//   }))
//   createDom(
//     {
//       type: 'div',
//       props: {
//         class: 'box-container'
//       },
//       children: nodes,
//     },
//     root
//   )
// }
