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

    for (const item of this.containerElement.children) {
      item.style.transition = 'transform 500ms'
    }

    console.log('最终dom结果', clone, this.clone.element)
  }
  onPointerMove(e) {
    if (this.isPointerDown) {
      // 移动量，当前位置的x 和y坐标，减去开始的 x 和 y  的坐标得出移动偏差量
      this.diff.x = e.clientX - this.lastPointerMove.x
      this.diff.y = e.clientY - this.lastPointerMove.y

      // 更新开始坐标
      Object.assign(this.lastPointerMove, {
        x: e.clientX,
        y: e.clientY,
      })

      // 初始坐标加上计算移动的偏差量，得出最终的移动坐标
      Object.assign(this.clone, {
        x: this.clone.x + this.diff.x,
        y: this.clone.y + this.diff.y,
      })

      console.log('最终的结果=>', )

      

      // 原来本身的坐标填充到复制dom对象身上
      this.clone.element.style.transform = `translate3d(${this.clone.x}px,${this.clone.y}px, 0)`
      if(e.clientX > e.height || e.clientY > e.width) {
        
      } 
      // 计算碰到了第几个元素
      // 只需要计算当先的
      // 碰撞检测
      // 只要指针的位置的x是否在数组的任意元素之内，y也在任意元素之内，那么就更新drag元素的下标

      for (let index = 0; index < this.rectList.length; index++) {
        if (index !== this.drag.index && e.clientX > this.rectList[index].left && e.clientX < this.rectList[index].right && e.clientY > this.rectList[index].top && e.clientY < this.rectList[index].bottom) {
          // 之后就开始移动元素，但并不是所有元素都要移动的，只有碰撞到的元素和当前鼠标拖动位置到的元素才进行移动
          console.log('整理元素的结果', this.drag.index, index)
          if (this.drag.index < index) {
            for (let j = this.drag.index; j < index; j++) {
              if (j < this.drag.firstIndex) {
                this.containerElement.children[j].style.transform = 'translate3d(0px,0px, 0)'
              } else {
                const x = this.rectList[j].left - this.rectList[j + 1].left
                const y = this.rectList[j].top - this.rectList[j + 1].top
                this.containerElement.children[j + 1].style.transform = `translate3d(${x}px, ${y}px, 0)`
              }
            }
            this.referenceElement = this.containerElement.children[index + 1]
          }

          // 记录要insertBefore的目标，也就是它后面的元素。
          // 如果drag的元素原来来在后面，那就是这个区间内的的firstIndex之后的不动，之前的往后移：
          else if (this.drag.index > index) {
            for (let j = index; j < this.drag.index; j++) {
              if (this.drag.firstIndex <= j) {
                this.containerElement.children[j + 1].style.transform = 'translate3d(0px,0px, 0)'
              } else {
                const x = this.rectList[j + 1].left - this.rectList[j].left
                const y = this.rectList[j + 1].top - this.rectList[j].top

                this.containerElement.children[j].style.transform = `translate3d(${x}px,${y}px, 0)`
              }
            }

            this.referenceElement = this.containerElement.children[index]
          }

          // 最后移动自己
          console.log('碰到了第几个元素', index)

          const x = this.rectList[index].left - this.rectList[this.drag.firstIndex].left
          const y = this.rectList[index].top - this.rectList[this.drag.firstIndex].top
          this.drag.element.style.transform = `translate3d(${x}px,${y}px, 0)`
          this.drag.index = index
          break
        }
      }
    }
  }
  onPointerUp(e) {
    if (this.isPointerDown) {
      this.isPointerDown = false

      // 如果发生移动，那么把需要插入的元素插入到拖拽元素的前面
      if (this.referenceElement !== null) {
        this.containerElement.insertBefore(this.drag.element, this.referenceElement)
      }

      this.drag.element.classList.remove('active')
      this.clone.element.remove()

      for (const item of this.containerElement.children) {
        item.style.transition = 'none'
        item.style.transform = 'translate3d(0px,0px,0)'
      }
    }
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
