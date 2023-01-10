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