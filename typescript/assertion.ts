// interface Bar {
//   name: string
//   getBar: () => string
// }

// interface Truck {
//   name: string
//   fn: () => string
//   getTruck: () => string
// }

// interface Car {
//   name: string
//   getCar: () => string
// }

class Vercial {
  myFn() {
    console.log('myFn')
    return 'myFn'
  }
}

class Bar extends Vercial {
  name: string
  getBar() {
    return 'getBar'
  }
}

class Truck extends Vercial {
  name: string
  fn() {
    console.log('fn')
  }
  getTruck() {
    return ''
  }
}

class Car extends Vercial {
  name: string
  getCar() {
    return ''
  }
}

type VercialType = Bar | Truck | Car

const AA: Vercial = new Car()

const isString = (str: unknown): str is string => typeof str === 'string'

const isBar = (car: unknown): car is Bar => car instanceof Bar

function judgeType(type: VercialType | string) {
  if (isString(type)) {
    //
  } else if (isBar(type)) {
    console.log(type)
  }
}
