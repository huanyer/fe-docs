```js
/**
 * @param {HTMLElement} dom 真实DOM
 * @param {vnode} vnode 虚拟DOM
 * @param {HTMLElement} container 容器
 * @return {HTMLElement} 更新后的DOM
 */
function diff(dom, vnode, container) {
  // diff算法的本质是diffNode，将dom和vnode进行对比
  const ret = diffNode(dom, vnode);
  if (container && ret.parentNode !== container) {
    // container用来将生成的DOM挂载到节点上
    container.appendChild(ret);
  }
  return ret;
}

function diffNode(dom, vnode) {
  let out = dom;
  if (vnode === undefined || vnode === null || typeof vnode === "boolean")
    vnode = "";
  if (typeof vnode === "number") vnode = String(vnode);
  // diff text node
  if (typeof vnode === "string") {
    // 如果当前的DOM就是文本节点，则直接更新内容
    if (dom && dom.nodeType === 3) {
      if (dom.textContent !== vnode) {
        dom.textContent = vnode;
      }
      // 如果DOM不是文本节点，则新建一个文本节点DOM，并移除掉原来的
    } else {
      out = document.createTextNode(vnode);
      if (dom && dom.parentNode) {
        dom.parentNode.replaceChild(out, dom);
      }
    }
    return out;
  }

  // 没有DOM或者不是同一节点的话
  if (!dom || !isSameNodeType(dom, vnode)) {
    // 创建节点
    out = document.createElement(vnode.tag);
    // 如果有DOM节点的话，把子节点移到新的节点下
    if (dom) {
      [...dom.childNodes].map(() => {
        return out.appendChild;
      });
      // 将原来的子节点移到新节点下
      if (dom.parentNode) {
        // 移除掉原来的DOM对象
        dom.parentNode.replaceChild(out, dom);
      }
    }
  }
  // 如果有子节点，那么执行diff算法比对子元素
  if (
    (vnode.children && vnode.children.length > 0) ||
    (out.childNodes && out.childNodes.length > 0)
  ) {
    diffChildren(out, vnode.children);
  }
  diffAttributes(out, vnode);
  return out;
}

function diffChildren(dom, vchildren) {
  const domChildren = dom.childNodes;
  const children = [];
  const keyed = {};
  // 将有key的节点和没有key的节点分开
  if (domChildren.length > 0) {
    for (let i = 0; i < domChildren.length; i++) {
      const child = domChildren[i];
      const key = child.key;
      if (key) {
        keyedLen++;
        keyed[key] = child;
      } else {
        children.push(child);
      }
    }
  }

  if (vchildren && vchildren.length > 0) {
    let min = 0;
    let childrenLen = children.length;
    for (let i = 0; i < vchildren.length; i++) {
      const vchild = vchildren[i];
      const key = vchild.key;
      let child;
      // 如果有key，找到对应key值的节点
      if (key) {
        if (keyed[key]) {
          child = keyed[key];
          keyed[key] = undefined;
        }
      }
      // 如果没有key，则优先找类型相同的节点
      else if (min < childrenLen) {
        for (let j = min; j < childrenLen; j++) {
          let c = children[j];
          if (c && isSameNodeType(c, vchild)) {
            child = c;
            children[j] = undefined;
            if (j === childrenLen - 1) childrenLen--;
            if (j === min) min++;
            break;
          }
        }
      }
      // 对比
      child = diffNode(child, vchild);
      // 更新DOM
      const f = domChildren[i];
      if (child && child !== dom && child !== f) {
        // 如果更新前的对应位置为空，说明此节点是新增的
        if (!f) {
          dom.appendChild(child);
          // 如果更新后的节点和更新前对应位置的下一个节点一样，说明当前位置的节点被移除了
        } else if (child === f.nextSibling) {
          removeNode(f);
          // 将更新后的节点移动到正确的位置
        } else {
          // 注意insertBefore的用法，第一个参数是要插入的节点，第二个参数是已存在的节点
          dom.insertBefore(child, f);
        }
      }
    }
  }
}

function isSameNodeType(dom, vnode) {
  if (typeof vnode === "string" || typeof vnode === "number") {
    return dom.nodeType === 3;
  }
  if (typeof vnode.tag === "string") {
    return dom.nodeName.toLowerCase() === vnode.tag.toLowerCase();
  }
  return dom && dom._component && dom._component.constructor === vnode.tag;
}

function diffAttributes(dom, vnode) {
  const old = {}; // 当前DOM的属性
  const attrs = vnode.attrs; // 虚拟DOM的属性
  for (let i = 0; i < dom.attributes.length; i++) {
    const attr = dom.attributes[i];
    old[attr.name] = attr.value;
  }
  // 如果原来的属性不在新的属性当中，则将其移除掉（属性值设为undefined）
  for (let name in old) {
    if (!(name in attrs)) {
      // setAttribute(dom, name, undefined);
    }
  }
  // 更新新的属性值
  for (let name in attrs) {
    if (old[name] !== attrs[name]) {
      // setAttribute(dom, name, attrs[name]);
    }
  }
}

function removeNode(dom) {
  if (dom && dom.parentNode) {
    dom.parentNode.removeChild(dom);
  }
}

let vnode1 = {
  attrs: {},
  children: [
    "Like",
    {
      attrs: {
        key: 3,
        onClick: () => {
          console.log({
            ...this
          });
        }
      },
      children: ["ok"],
      key: 2,
      tag: "p"
    }
  ],
  key: 1,
  tag: "header"
};

let vnode2 = {
  attrs: {},
  children: [
    "ABC",
    {
      attrs: {
        key: 3,
        onClick: () => {
          console.log({
            ...this
          });
        }
      },
      children: ["ok"],
      key: 2,
      tag: "p"
    }
  ],
  key: 1,
  tag: "header"
};

let vnode3 = {
  attrs: {},
  children: [
    "ABC",
    {
      attrs: {
        key: 3,
        onClick: () => {
          console.log({
            ...this
          });
        }
      },
      children: ["ok"],
      key: 2,
      tag: "button"
    }
  ],
  key: 1,
  tag: "header"
};

let vnode4 = {
  attrs: {},
  children: [
    "ABC",
    {
      attrs: {
        key: 3,
        onClick: () => {
          console.log({
            ...this
          });
        }
      },
      children: ["ok"],
      key: 2,
      tag: "button"
    }
  ],
  key: 1,
  tag: "footer"
};
// 四份DOM的变化，除了第一次，后面都是两两比对
let dom1 = diff(null, vnode1, document.querySelector("#demo1"));
console.log(dom1);
// Like -> ABC
let dom2 = diff(
  document.querySelector("#demo1"),
  vnode2,
  document.querySelector("#demo2")
);
console.log(dom2);
// <p>ok</p> -> <button>ok</button>
let dom3 = diff(
  document.querySelector("#demo2"),
  vnode3,
  document.querySelector("#demo3")
);
console.log(dom3);
// <header>...</header> -> <footer>...</footer>
let dom4 = diff(
  document.querySelector("#demo3"),
  vnode4,
  document.querySelector("#demo4")
);
console.log(dom4);
```
