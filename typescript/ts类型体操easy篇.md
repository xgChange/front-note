# typescript 类型体操(easy 篇) —— 容易忽视的 typescript 知识

## typescript 是什么?

> 简单来说就是给 js 加上类型。让编译器可以识别做到智能提示，应用于开发阶段。（详情 google）

## typescript 类型体操(easy 篇)

> 主要是基于类型去编程。我们在编写自己的库、工具，或者极少数业务场景下需要自己去写一些类型（定制化的），这时候我们就要对类型进行编程，变成我们想要的类型。

> 本篇主要以 [type-challenges](https://github.com/type-challenges/type-challenges)这个库作为练习进行讲解。

1. Hello World

```typescript
const helloWorld: string = 'Hello World'
```

2. Readonly

   实现 ts 内置的 Readonly 类型

   ```typescript
     interface MyInfo {
       name: string
       age: number
     }

     // 将 MyInfo 变为 Readonly
     interface MyInfoReadonly {
       readonly name: string
       readonly age: number
     }

     // 我们实现一个类型 MyReadonly，可以传入泛型T，并将T变为只读
     interface MyReadonly<T> = {
       readonly [k in keyof T]: T[k]
     }
   ```

   问题： keyof 是什么？简单点就是获取类型的 key，例如 MyInfoReadonly 中，k 为 name | age。 而 in 就是进行一个遍历

3. Tuple to Object

   将元组转换为 Object 类型

   ```typescript
    const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const

    type result = TupleToObject<typeof tuple>
    // expected { tesla: 'tesla', 'model 3': 'model 3', 'model X': 'model X', 'model Y': 'model Y'}


    // 1. 首先需要获取元组中的类型，并将它转换为字符串字面量联合类型 type tupleInnerType = 'tesla' | 'model 3' | 'model X' | 'model Y'

    // 方法1
    type TupleKeyType<T extends readOnly any[]> = T extends readonly (infer P)[] ? P : never // 这个会返回 key的联合类型

    // 方法2
    type TupleKeyType<T extends readOnly any[]> = T[number] // 直接获取数组里面的number类型 即 值类型

    // 2. 后面将联合类型转化成对象类型就简单了
    type TupleToObject<T extends readOnly any[]> = {
      [k in TupleKeyType<T>]: k
    }
   ```

   问题：infer 是什么？用来推测变量的类型，一般与 extends 连用。例如元组里面的元素类型是固定的，如果 T extends (infer P)[]，那么就获取 T 中的类型，并且返回该类型

4. Exclude

   实现 ts 内置的 Exclude 类型

   ```typescript
   // 例如
   type result = MyExclude<'a' | 'b' | 'c', 'a'> // 期望返回 'b' | 'c'

   // 答案
   type MyExclude<T, U> = T extends U ? never : T
   ```

   问题：为什么一个 extends 就能实现呢？ 因为 extends 在泛型中使用和在普通使用是不同的。看下面的例子

   ```typescript
   type isTrue = boolean extends true ? true : false // false

   type isTrue2<T> = T extends true ? true : false

   type result = isTrye2<boolean> // boolean
   // 为什么通过传入泛型表现会不一致呢？ 因为它在内部其实会把这个联合类型分别去比较，然后取他们的结果集的联合类型

   // 例如 传入 boolean 会变成 true | false，然后true extends true => true； false extends true => false。 最后返回 true | false
   ```

5. Awaited

   实现获取被 Promise 包裹的类型

   ```typescript
   // 例如
   type X = Promise<string>
   type Z = Promise<Promise<string | number>>

   type result1 = MyAwaited<X> // string
   type result2 = MyAwaited<Z> // string | number

   // 答案

   // 先用infer推测出 Promise包裹的类型，如果是Promise类型的话，进行递归调用 MyAwaited
   type MyAwaited<T extends Promise<any>> = T extends Promise<infer P>
     ? P extends Promise<any>
       ? MyAwaited<P>
       : P
     : T
   ```

6. infer

   利用 infer 我们可以获取函数参数、返回值、数组项的类型。如下，获取数组第一项类型

   ```typescript
   type FirstType<T> = T extends [infer P, ...infer Rest] ? P : never

   type result = FirstType<[1, 2, 'string']> // 1
   ```
