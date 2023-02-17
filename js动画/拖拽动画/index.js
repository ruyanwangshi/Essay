const list = new Array(9).fill(0).map((_,index) => `${index}${index}${index}`);
console.log(list)

const root = document.getElementById("root");


render(root)

function createDom(type, content) {
    const dom = document.createElement('type');
    dom.innerHTML = content
    return dom
}


function render(root) {
    const nodes = list.map(item => createDom('div', item))
    root.append(nodes)
}