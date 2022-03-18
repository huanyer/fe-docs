class A {
  constructor(fn) {
    if (typeof fn !== "function") {
      throw new Error("argument must be function");
    }
    this.status = "pending";
    this.value = "";
    this.resolveCallbacks = [];
    this.rejectCallbacks = [];
    fn(this.resolveCallback, this.rejectCallback);
  }

  resolve = value => {
    if (value instanceof A) return value;
    return new A(resolve => resolve(value));
  };

  reject = value => {
    if (value instanceof A) return value;
    return new A((resolve, reject) => reject(value));
  };

  execEvents = (list, val) => {
    this[list].map(callback => callback(val));
  };

  resolveCallback = value => {
    setTimeout(() => {
      if (value instanceof A) {
        value.then(val => {
          this.status = "fulfilled";
          this.value = val;
          this.execEvents("resolveCallbacks", val);
        });
      } else {
        this.status = "fulfilled";
        this.value = value;
        this.execEvents("resolveCallbacks", value);
      }
    }, 0);
  };

  rejectCallback = value => {
    setTimeout(() => {
      this.status = "rejected";
      this.value = value;
      this.execEvents("rejectCallbacks", value);
    }, 0);
  };

  then = (onResolve, onReject) => {
    return new A((onThenResolve, onThenReject) => {
      const onFulilled = value => {
        const result = onResolve(value);
        if (result instanceof A) {
          result.then(onThenResolve, onThenReject);
        } else {
          onThenResolve(result);
        }
      };
      //略
      const onReject = err => {};

      if (this.status === "pending") {
        this.resolveCallbacks.push(onFulilled);
      } else if (this.status === "fulfilled") {
        onFulilled(this.value);
      } else if (this.status === "rejected") {
        onReject(this.value);
      }
    });
  };
}
