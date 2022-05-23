# Vue3 高阶组件带 ts 类型的写法、PromiseAll 增强实现

## vue3 配合 TS 类型 写一个高阶组件

> 虽然在 Vue 中高阶组件用的并不是很多，而高阶组件也只是为了代码复用的一种方式而已。况且 Vue3 已经有 hooks 了，很多时候可以直接基于 hooks 编程。

> 但是 hooks 只是基于逻辑的封装和抽离，很多时候我们也可以将视图进行抽离。

例如我们在父组件内有一段`<Parent><ChildOne /></Parent>`，有可能很多地方都用到了**Parent**组件`<Parent><ChildTwo /></Parent>`

这样可能在一个作用域内我们有很多的重复代码。如果我们用 jsx、tsx 的方式去抽成一个函数的话也能做但是考虑到拓展性，我们可以把重复的视图逻辑抽到一个函数中去，也就是**高阶组件**

**我们可以通过 ts 去限制传入的 component 类型，然后在调用的时候获取更好的类型提示和校验**

```tsx
import { DefineComponent, ExtractPropTypes, defineComponent } from 'vue'

// parent 组件
const parentProp = {
  msg: {
    type: String as PropType<string>,
  },
} as const

const Parent = defineComponent({
  props: parentProp,
  setup(props, { slots }) {
    return () => <h1>{slots?.default?.()}</h1>
  },
})

// withParent 高阶函数
function withParent<T extends Object>(
  Widget: DefineComponent<ExtractPropTypes<T>>
) {
  return defineComponent<
    ExtractPropTypes<typeof parentProp> & ExtractPropTypes<T>
  >({
    props: { ...parentProp, ...Widget.props },
    setup(props, { slots }) {
      return () => {
        const { msg, ...rest } = props
        return (
          <Parent msg={msg}>
            <Widget {...(rest as any)}>{slots?.default?.()}</Widget>
          </Parent>
        )
      }
    },
  })
}


// 父组件作用域下去调用
const WrapperChildOne = withParent(ChildOne)

<ChildOne msg="" {这里可以传入ChildOne自己的prop} />

```

如上面代码所示，我们封装了**withParent**函数，允许传入一个 Component，最后渲染的也是传入的 Component，这个函数没有改变传入的组件的状态，是一个纯函数。

在 ts 方面，我们通过 **vue 内置的 ExtractPropTypes 和 DefineComponent 去定义组件和 props 的类型，并拓展他们**，所以我们在外面调用时可以通过范型动态传入组件类型，编译器可以识别 **withParent 返回的组件 Prop 类型和传入的组件 prop 类型**，并在编译时进行校验。

**总结：因为 Vue3 组件的 prop 还是以 option 形式去定义的，所以在拓展 prop 的时候需要拓展 prop 对象，并且指定拓展后的类型。react 中因为组件就是函数，所以比较方便用类型进行拓展**

## 增强 Promise.all 功能

总所周知，Promise.all 只要有一个 promise 被 reject，整个状态就被 reject 了。我们此时有个需求，需要传入的 promise 数组，状态都不是 pending 时再把 promise.all 返回的 promise 状态改变。

```javascript
// 例如有 p1, p2, p3
const p1 = Promise.resolve({ message: '我是2' })
const p2 = Promise.reject({ code: 2, message: '我是3' })
const p3 = Promise.reject({ code: 1, message: '我是1' })

// 传入到Promise.all里面去的话，当他遇到第一个reject，整个状态就被reject了，不会执行下面的操作了。
```

所以我们通过 typescript 改造一下 Promise.all

```typescript
/**
 * @description 增强Promise.all，因为promise.all只要有一个被reject，就直接reject了。这个会等待所有promise都fullied才fullied
 * T 是 arr类型，必须是Prmise数组
 * R 是 自定义的Error类型，如果需要自定义过滤Error的话就需要指定
 */
export const withPromiseAll = <
  T extends Promise<Awaited<T[number]> | undefined>[],
  R = undefined,
  E = unknown,
  U = R extends undefined ? Awaited<T[number]> : Awaited<T[number]> | R
>(
  arr: T,
  errorHandler?: (error: any) => Promise<R>
) => {
  type resultType = U

  const result: resultType[] = []
  let count = 0
  return new Promise<resultType[]>((resolve, reject) => {
    arr.forEach((item, index) => {
      item
        .then((r) => {
          return Promise.resolve(r)
        })
        .catch((e) => {
          return Promise.resolve(e)
        })
        .then((r) => {
          result[index] = r as resultType
          if (r === undefined) {
            if (++count === arr.length) {
              resolve(result)
            }
          } else {
            if (errorHandler) {
              errorHandler(r)
                .then(() => {
                  if (++count === arr.length) {
                    resolve(result)
                  }
                })
                .catch((e) => {
                  reject(e as E)
                })
            } else {
              if (++count === arr.length) {
                resolve(result)
              }
            }
          }
        })
    })
  })
}
```

> 大概的意思呢就是说传入 promise 数组，数组里面所有的状态都变更了（无论 fullfiled 还是 rejected），最后再返回一个 promise。把 reject 和 resolve 的 都收集到 result 数组里面去，最后再 resolve。但是我们可能想要数组中有些 promise 被 reject，我们可以传入**errorHandler**，自定义哪些 promise 被 reject

```typescript
// 测试代码

const codeWhiteList = [1]

const arr = [1, 2, 3, 4].map((item) => {
  if (item === 2) {
    return Promise.resolve({ message: '我是2' })
  }
  if (item === 3) {
    return Promise.reject({ code: 2, message: '我是3' })
  }
  if (item === 4) {
    return Promise.resolve(undefined)
  }
  return Promise.reject({ code: 1, message: '我是1' })
})

const mockFunc = () => {
  // 例如这个，只有在白名单内的reject状态才能被 resolve。
  withPromiseAll<
    { -readonly [K in keyof typeof arr]: typeof arr[K] },
    { code: number; message: string }
  >(arr, (e) => {
    return new Promise((resolve, reject) => {
      if ('code' in e) {
        if (!codeWhiteList.includes(e?.code)) {
          reject(e)
        } else if (codeWhiteList.includes(e?.code)) {
          resolve(e)
        }
      }
    })
  })
    .then((r) => {
      r.map((item) => {
        if (item !== undefined) {
          return item
        }
        return item
      })
    })
    .catch((e: { message: string }) => {
      console.log(e)
    })

  // basic case
  withPromiseAll(arr).then((r) => {
    r.map((item) => {
      if (item !== undefined) {
        return item
      }
      return item
    })
  })
}

mockFunc()
```
