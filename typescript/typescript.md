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
