// const event = new EventEmitter()

// // 绑定事件
// event.on(name, callback)
// // 绑定只会执行一次的事件
// event.once(name, callback)
// // 取消绑定
// event.off(name)
// // 触发事件
// event.trigger(name, data)

//发布订阅模式

class EventEmitter {
  constructor() {
    this.events = {};
  }

  on = (name, callback, once) => {
    if (!this.events[name] || !!once) {
      this.events[name] = [];
      if (!!once) callback.realCallback = callback;
    }
    this.events[name].push(callback);
  };

  once = (name, callback) => {
    this.on(name, callback, true);
  };

  off = (name, callback) => {
    if (!this.events[name] || !callback) return;
    this.events[name] = this.events[name].filter(
      (fn) =>
        fn.toString() !== callback.toString() &&
        (!callback.realCallback ||
          fn.toString() !== callback.realCallback.toString())
    );
  };

  trigger = (name, data) => {
    const fns = this.events[name];
    if (!fns || !fns.length) return;
    this.events[name].forEach((callback) => {
      callback.call(this, data);
      if (callback.realCallback) delete this.events[name];
    });
  };
}

var event = new EventEmitter();
event.on("add", function (value) {
  console.log(`add1 ${value}`);
});
event.on("add", (value) => console.log(`add2 ${value}`));
event.on("delete", (value) => console.log(`delete ${value}`));
event.trigger("add", 1);
