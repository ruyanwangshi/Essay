function createDom(vnode, container) {
  const dom = complier(vnode)
  if (Array.isArray(vnode.children) && vnode.children.length) {
    vnode.children.forEach((item) => {
      createDom(item, dom)
    })
  }

  if (container) {
    container.appendChild(dom)
  }

  return dom
}

function complier(vnode) {
  const dom = document.createElement(vnode.tag)
  if (vnode.props) {
    iteration(vnode.props, (key) => {
      dom[key] = vnode.props[key]
    })
  }
  if (vnode.style) {
    iteration(vnode.style, (style) => {
      dom.style[style] = vnode.style[style]
    })
  }
  if (vnode.attr) {
    iteration(vnode.attr, (attr) => {
      dom.setAttribute(attr, vnode.attr[attr])
    })
  }
  if (vnode.on) {
    iteration(vnode.on, (key) => {
      dom.addEventListener(key, vnode.on[key])
    })
  }
  return dom
}

function iteration(obj, callback) {
  const keys = Object.keys(obj)
  keys.forEach(callback)
}
