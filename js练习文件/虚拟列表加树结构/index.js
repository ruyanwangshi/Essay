class VirtualScroll {
  constructor(options) {
    this.$list_container = options.el // 视口元素
    this.list = options.list // 需要展示的列表数据
    this.itemHeight = options.itemHeight // 给每个列表元素的高度
    this.itemElementGenerator = options.itemElementGenerator
    // this.scroll_container = options.scroll_container
    // this.renderScroll = options.renderScroll
    this.scrollDom = null

    // 初始化传入的列表信息
    this.map_list()
    // 初始化容器高度以及容器样式
    this.init_container()
    // 初始化虚拟列表的偏移量
    this._virtual_offset = 0
    this.virtual_offset = this._virtual_offset
    // 绑定对应事件
    this.bind_events()
    // 缓冲条数
    this.cache_count = 10
    // 缓存区
    this.render_list_with_cache = []
    // 渲染滚动条
    this.render_scroll()
  }
  //   // 渲染滚动条
  render_scroll() {
    
    this.scrollDom = document.createElement('div')

    // if (this.virtual_offset > this.content_height) {
    //   this.show_scorll = true
    // }
    
    // const scroll = this.renderScroll()

    this.scroll_container.appendChild(this.scrollDom)
    // console.log('初始化了滚动条', this.scrollDom)
  }
  // 总滚动距离
  set virtualOffset(val) {
    this._virtual_offset = val
    this.render(val)
  }
  // 总滚动距离
  get virtualOffset() {
    return this._virtual_offset
  }
  init_container() {
    this.container_height = this.$list_container.clientHeight
    this.$list_container.style.overflow = 'hidden'

    // 汇总列表的总高度
    this.content_height = sum_height(this._list)
  }
  map_list() {
    this._list = this.list.map((item, index) => {
      return {
        height: this.itemHeight,
        index,
        item,
      }
    })
  }
  bind_events() {
    let y = 0
    const scrollSpace = this.content_height - this.container_height
    /**
     *
     * @param { Event } e
     */
    const update_offset = (e) => {
      //   e.perventDefault()
      //   e.preventDefault()

      y += e.deltaY
      y = Math.max(y, 0) // 处理上面的边界
      y = Math.min(y, scrollSpace) // 处理底部边界

    }

    const redner_offset = throttle(() => {
      this.virtualOffset = y
    }, 60)
    this.$list_container.addEventListener('wheel', update_offset, { passive: true })
    this.$list_container.addEventListener('wheel', redner_offset, { passive: true })
  }
  render(virtualOffset) {
    const head_index = find_index_over_height(this._list, virtualOffset)
    const tail_index = find_index_over_height(this._list, virtualOffset + this.container_height)

    let render_offset

    // 当前滚动距离仍在缓存区内
    if (within_cache(head_index, tail_index, this.render_list_with_cache)) {
      // 只改变transLateY
      const head_index_with_cache = this.render_list_with_cache[0].index
      render_offset = virtualOffset - sum_height(this._list, 0, head_index_with_cache)
    }

    // 下面的就和之前做法基本一样，但是列表增加了签后缓存元素
    const head_index_with_cache = Math.max(head_index - this.cache_count, 0)
    const tail_index_with_cache = Math.min(tail_index + this.cache_count, this._list.length)

    // 添加缓存列表
    this.render_list_with_cache = this._list.slice(head_index_with_cache, tail_index_with_cache)

    render_offset = virtualOffset

    this.render_dom_list(render_offset)
  }
  render_dom_list(render_offset) {
    this.$list_inner = document.createElement('div')
    this.render_list_with_cache.forEach((item) => {
      const $el = this.itemElementGenerator(item)
      this.$list_inner.appendChild($el)
    })
    this.$list_inner.style.transform = `translateY(-${render_offset}px)`
    const min_height = 55
    console.log('偏移中~', render_offset / this.content_height * 100 + 55)
    const scroll_res = render_offset / this.content_height * 100 + 55;
    this.scrollDom.style.transform = `translateY(${scroll_res}px)`
    this.scrollDom.style.height = `${55}px`
    this.scrollDom.style.background = `red`
    this.scrollDom.style.width = `${min_height}px`
    this.$list_container.innerHTML = ''
    this.$list_container.appendChild(this.$list_inner)
  }
}

function within_cache(current_head, currend_tail, render_list_with_cache) {
  if (!render_list_with_cache.length) return false
  const head = render_list_with_cache[0]
  const tail = render_list_with_cache[render_list_with_cache.length - 1]

  const within_range = (num, min, max) => num >= min && num <= max

  return within_range(current_head, head.index, tail.index) && within_range(currend_tail, head.index, tail.index)
}

function throttle(callback, dely) {
  let now_timer = 0
  return function (e) {
    const timer = new Date().getTime()
    if (timer - now_timer > dely) {
      callback(e)
      now_timer = timer
    }
  }
}

function find_index_over_height(list, offset) {
  let current_height = 0
  for (let i = 0; i < list.length; i++) {
    const { height } = list[i]
    current_height += height

    if (current_height > offset) {
      return i
    }
  }

  return list.length - 1
}

function sum_height(list, start = 0, end = list.length) {
  let height = 0
  for (let i = start; i < end; i++) {
    height += list[i].height
  }
  return height
}
