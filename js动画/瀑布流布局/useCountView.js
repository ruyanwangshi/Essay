/**
 * @desc 队列高度列表
 */
const heightList = []
/**
 * @desc 数据列表
 */
let dataList = []
/**
 * @desc 视图数据列表
 */
const viewData = []
/**
 * @desc 当前已加入视图数据列表，总数居下标
 */
let currentIndex = 0
/**
 * @desc 展示列数
 */
let columnNumber = 2
/**
 * @desc 需要加入视图列表的指针
 */
let i = 0

/**
 * @description: 初始load函数
 * @param callback 初始化一页数据之后的回调通知函数
 * @returns load加载回到函数
 */
function initload(callbac) {
  return function (e) {
    if (!e?.path[1]) {
      return
    }

    const elHeight = e.path[1].clientHeight
    heightList[i] = elHeight + heightList[i]
    // 更改push队列坐标
    i = checkHeight()
    // 当前数据是否加载完成
    if (currentIndex === dataList.length) {
      const handlerOptions = {
        heightList: heightList,
        currentIndex: currentIndex,
        columnNumber: columnNumber,
        index: i,
      }
      callback(handlerOptions)
      return
    }
    setViewData(dataList)
  }
}

/**
 * @description: 校验高度
 * @returns 下一个push队列的指针
 */
function checkHeight() {
  const minHeight = Math.min(...heightList)
  const nextIndex = heightList.findIndex((item) => minHeight === item)
  return nextIndex
}

/**
 * @description: 初始化瀑布流参数
 * @param {any[]} list - 视图数据源
 * @returns [视图数据, 设置视图方法，初始load方法]
 */
function useCountView(list, column) {
  if (Array.isArray(list)) {
    dataList = list
  }
  if (typeof column === 'number') {
    columnNumber = column
  }
  for (let i = 0; i < columnNumber; i++) {
    viewData.push([])
    heightList.push(0)
  }
  return [viewData, setViewData, initload]
}

/**
 * @description: 设置队列值
 * @param {any[]} list - 视图数据源
 * @returns 下一个push队列的指针
 */
function setViewData(list) {
  viewData[i].push(list[currentIndex++])
}

export default useCountView
