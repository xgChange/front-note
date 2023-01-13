# 基础知识

## 配置文件

```javascript
{
  outDir: './dist', // 编译后生成的js保存的目录
  rootDir: './src'  // 编写ts文件所在的目录
}
```

## 函数重载

### 微信消息的例子(模拟)

```typescript
interface Message {
  id: number
  type: string
  msg: string
}

const message: Message[] = [
  {
    id: 1,
    type: 'image',
    msg: '111',
  },
  {
    id: 2,
    type: 'video',
    msg: '22',
  },
]

function getMessage(id: number): Message | undefined
function getMessage(type: string): Message[]
function getMessage(value: string | number): Message[] | Message | undefined {
  // 这里是运行时
  if (typeof value === 'number') {
    return message.find((item) => item.id === value)!
  }
  return message.filter((item) => item.type === value)
}
```

#### 函数重载的规则

- 函数签名 = 函数名称 + 函数参数 + 函数参数类型 + 返回值

- 靠近函数体的函数是实现签名，其他的是重载签名。实现函数签名应该包含所有重载签名类型

- 实现签名参数个数可以少于重载签名的参数个数，但实现签名如果准备包含重载签名的某个位置的参数，那实现签名就必须兼容所有重载签名该位置的参数类型

#### 何时用 any，何时用 unknown

- unknown 只能作为其他类型的父类，不能作为其他类型的子类

```typescript
let x: unknown = 3
let k: number = x // 报错，unknown 不能分配给 number
```

#### 实现简易版 ArrayList 类

- 对现有数组进行封装，get、remove、add。[ArrayList](./ArrayList.ts)

## TS 类的静态成员

### 静态成员保存在哪里？

```javascript
/**
 * 静态方法会一直存在内存中，无论调用多少次这个静态方法，都是调用同一块空间
 *
 * 无论是否创建实例，创建多少哥实例，是否调用改静态方法或静态属性，TS都会为这个静态方法或者静态属性分配内存空间
 */
```

## 类型守卫 - 多态

> 类型守卫主要是为了收缩类型，比如：isObject，就可以将类型缩小，而为 true 时，变量就变为 object 了，并且有类型提示

### 类型断言

```typescript
// 联合类型出来的类型，是这几个类型都有的方法

// 例如
class Bus {
  name: string
  getBar() {
    return 'getBar'
  }
}

class Truck {
  name: string
  fn() {
    console.log('fn')
  }
  getTruck() {
    return ''
  }
}

class Car {
  name: string
  getCar() {
    return ''
  }
}
type VechileType = Bus | Truck | Car
// 则 VerchileType 就是这三个公有的

const a!: VercialType
a.name // 只能点出这个
```

### 多态

```typescript
// 父类对象变量可以接收任何一个子类对象

const parent: Parent = new Child() // Child实例可以赋值给 parent

// 通过不同的子类赋值给父类，父类调用相同子类的方法，会输出不一样的结果
```

- 产生多态的条件：必须存在继承、必须有方法重写

- 局限性：无法直接调用子类独有的方法，必须结合 instanceof 类型守卫来解决

- 多态体现在：父类对象变量可以接受任何它的子类对象、接口类型对象变量可以接受任何他的实现类的对象

```typescript
interface List {}

class MyList implements List {}
class LinkedList implements List {}

// 那么无论是 MyList类型还是LinkedList类型都可以赋值给 List
```

### 抽象类(任何一个毫无意义的类都可以被定义为抽象类)

- 子类需要实现抽象类的抽象方法，未被抽象的，可以不用实现

```typescript
interface IA {
  getName(): void
  getAge(): string
  setName(): void
}

abstract class A implements IA {
  constructor(private a: string) {}
  abstract setName(): void

  getName() {}

  abstract getAge(): string
}

class B extends A {
  getAge(): string {
    throw new Error('Method not implemented.')
  }

  setName() {}
}
```

### 自定义守卫 (is)

- 在使用自定义守卫的目的是，在条件判断时，能够将类型缩小

```typescript
const isString = (str: unknown): str is string => typeof str === 'string'

const isBar = (car: unknown): car is Bar => car instanceof Bar

function judgeType(type: VercialType | string) {
  if (isString(type)) {
    //
  } else if (isBar(type)) {
    console.log(type)
  }
}
```

### as const ，让一个变量，或者里面所有属性变为只读

```typescript
const a = [1, 2, 3] as const
a[0] // 修改属性也会报错
```

### 可变元组

```typescript
const arr: [string, number, ...any[], number] = ['a', 1, 2, 'ddd', 55] // 前两个和最后一个是固定类型，中间的是任意类型
```

## 泛型

### 为什么 object 不能替代类上的泛型

- object 类型数据获取属性和方法时无自动提示

  > tips: Object 和 object 类型区别：Object 代表所有类型的父类，是从 js 过来的。而 object 类型只能代表所有对象类型

- 因为 object 只能接收 object 类型的变量，非 object 就不能接收了

### 为什么 any 不能替代泛型

- any 可以获取任何属性和方法，不会出现编译错误。而泛型如果被具体化某类型后，越界使用会报错。
- any 无自动提示，泛型有

### 泛型约束 (T extends object)

```typescript
// 表示具体话的类型必须是 object 类型，任何类的实例都符合 T extends object
class Container<T extends object> {
  //
}

T = any // 这个代表默认类型

class ObjectRefImpl<T extends object, K extends keyof T> {} // 表示 T 是object类型，K限制为T的属性类型
```

- keyof

```typescript
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

type MyKeys = keyof Container<object> // 获取实例、原型上的属性名字当作联合类型

type StaticKeys = keyof typeof Container<object> // 获取静态方法、属性名字当作联合类型 + prototype

// const a: MyKeys = ''

const c = new Container()
```

### 构造函数类型

> ts 不能直接 new 一个函数来创建实例，必须是 new 构造函数

```typescript
// 构造函数签名
interface CommonConstructorFn<T, R extends any[]> {
  new (...args: R): T
}

// 工厂函数，可以获取传入的构造函数类型和参数类型
function generate<T, R extends any[]>(
  innerClass: CommonConstructorFn<T, R>,
  ...rest: R
) {
  return new innerClass(...rest)
}

// 使用
class A {
  constructor(private a: string) {}
  name: string = '1'
}
const obj = generate(A, '1')
```

## vue3 上的泛型相关知识

- [T] extends [Ref] ? T : Ref<UnwrapRef<T>> 为什么要用这个去判断

```typescript
// 这个重载类型，[T] extends [Ref]
export function ref<T extends object>(
  value: T
): [T] extends [Ref] ? T : Ref<UnwrapRef<T>>
```

## 交叉类型

> 多个类型合并【多个类属性和方法的并集】成的类型就是交叉类型

```typescript
type A1 = { name: string; age: number }
type A2 = { name: string; fn: boolean }

type Merge = A1 & A2

const AA: Merge = {
  name: '1',
  age: 2,
  fn: false,
}
```

- 交叉类型和联合类型区别：

> 交叉类型变量可以获取两个类型的任意属性和方法，而联合类型的变量只能获取两个类型的共同属性和方法

```typescript
type A1 = { name: string; age: number }
type A2 = { name: number; fn: boolean }

type Merge = A1 & A2

// const AA: Merge = {
//   name: '1',
//   age: 2,
//   fn: false
// } // 全部都能获取到

type All = A1 | A2
const BB: A1 | A2 = {
  age: 1,
  name: '2',
  fn: false,
}

BB.name // 只有BB.name
```

- 例子

```typescript
type MyObject = Record<string, any>
function cross<T extends MyObject, P extends MyObject>(o1: T, o2: P): T & P {
  const obj = {} as any

  Object.keys(o1).forEach((key) => {
    obj[key] = o1[key]
  })

  Object.keys(o2).forEach((key) => {
    if (!o2.hasOwnProperty(key)) {
      obj[key] = o2[key]
    }
  })

  return obj as T & P
}

const obj1 = {
  name: 'xmx',
  age: 12,
}

const obj2 = {
  fn() {
    return 1
  },
  msg: 'This is message',
}

const mergeObj = cross(obj1, obj2)
```

- 泛型函数重载+交叉类型+类型断言 [MergeArrType](./generic-example/MergeArrType.ts)

  > 函数接受多个 object 类型，并将他们属性合并，相同的属性不覆盖。

  ```typescript
  const obj1 = {
    name: '1',
    age: 1,
  }

  const obj2 = {
    name: '2',
    msg: 'This is message',
  }

  const mergeObj = merge(o1, o2) // {name: '1', age: 1, msg: 'This is message'}
  ```
