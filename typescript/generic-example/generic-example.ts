class Container<T extends object> {
  name: T
  fn() {
    return 12
  }

  static myFn() {
    return 'myFn'
  }

  static staticName = 2
}

type MyKeys = keyof Container<object>

type StaticKeys = keyof typeof Container<object> // myFn | staticName | prototype

// const a: MyKeys = ''

const c = new Container()
