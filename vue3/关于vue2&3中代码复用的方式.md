# 关于 vue2、vue3 中代码复用的方式——（Mixin、Render Props、HOC、Composition Api(hooks)）

> 当一个项目发展到一定复杂性的时候，代码组织起来就会很复杂，所以将一些逻辑、视图抽出来复用就是很有必要了。

> 本文将介绍在**vue2、vue3**中**代码复用**的一些方式。

## Mixin

在 vue2 中比较主流的代码复用是通过 mixin 来实现的。将一些公共 state、methods、生命周期等抽离到一个对象中，然后在相应组件需要的时候通过**mixins 选项**导入进来。

```tsx
// commonMixin.ts
const commonMixin = {
  created() {
    console.log('common created')
  },
}

// A组件
defineComponent({
  mixins: [commonMixin],
  created() {
    console.log('A created')
  },
})

// => common created
// => A created
```

缺点:

- this 指向不明，在 mixin 中可以使用 this 去获取组件上的一些数据，但是如果这个 mixin 被多个组件使用，则会造成 this 指向不明。
- 容易造成命名冲突

[官网](https://vuejs.org/guide/reusability/composables.html#comparisons-with-other-techniques)有对 mixin 方式的缺陷做解释

## Render Props

其实就是将 render 函数通过 prop 传入到组件中。render 函数返回一个 VNode。例如在 Vue 中:

```tsx
// A.tsx
defineComponent({
  props: {
    icon: {
      type: [String, Function] as PropType<string | (() => VNodeChild)>,
      required: true,
    },
  },
  setup(props) {
    const { icon } = props
    const iconChild = icon && typeof icon !== 'string' ? icon() : icon
    return () => {
      return <div>text - {iconChild}</div>
    }
  },
})
```

这种 Render Props 方式在很多组件库中有应用：**naive、element、antd**等。其实在 vue 中 Render Props 可以用 scope Slots 替代，这样可以在 sfc、tsx 中一起使用。但是在 React 中没有插槽这个概念，所以他们用 Render Props 去实现类似 vue 中 scope slots 功能。

## HOC - 高阶组件

顾名思义高阶组件就像高阶函数一样。HOC 是一个函数，接受组件作为参数，返回的是一个新的组件。

> 虽然在 vue 中用到的不多，之前看 antdv 源码的时候里面用了挺多高阶组件。(可能是一群写 react 人去写 vue 组件的吧~)

主要功能

- 增强 props
- 劫持 slot
- 复用一些公共代码

```tsx
const withLogComponent = (Com: DefineComponent): DefineComponent => {
  return defineComponent({
    setup(props, { attrs }) {
      onCreated(() => {
        console.log('log-created')
      })

      return () => {
        // 这里可以自定义返回的内容，也可以劫持Com的slot，构建一个新的slot
        const slots = {
          default: () => 'default'
        }
        return <Com {...props} {...attrs} v-slots={slots} />
      }
    },
  })
}

const A = defineComponent({
  props: {
    icon: {
      type: [String, Function] as PropType<string | (() => VNodeChild)>,
      required: true,
    },
  },
  setup(props) {
    const { icon } = props
    const iconChild = icon && typeof icon !== 'string' ? icon() : icon
    return () => {
      return <div>text - {iconChild}</div>
    }
  },
})

const NewCom = withLogComponent(A)

// 在sfc、tsx中可以
<NewCom class="className" />
<NewCom class="className">
  slots
</NewCom>
```

在 vue 中使用的缺点：

- 没有现成的 api 转发 Ref。(例如在 react 中可以，forwardRef，将高阶组件的 ref 转发给返回的新组件)，可能在后面有 rfc

## Compositon Api (hooks)

> 组合式 API。可以使用 vue 提供的一些组合式 API 来组织代码，并且这些 API 的组合可以不用在组件内里面去编写，可以单独抽离出去。[Vue 关于 composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

例如设置主题颜色时我们可以将这段逻辑抽离到一个 hooks 文件中去，暴露 useTheme(用来设置 theme)、useGetTheme(获取当前的主题)

```tsx
// 这里我们使用 Naive UI 自带的主题切换功能. App.vue template 如下
  <NConfigProvider
    ref="containerRef"
    theme={curTheme}
    class="app-main-container"
  >
    <NMessageProvider>
      <router-view />
    </NMessageProvider>
    <NAffix
      class="affix-content"
      position="absolute"
      bottom="40"
      listen-to={() => containerRef?.$el}
    >
      <NButton v-if="false" onClick={switchDarkTheme}>
        {{ isDarkMode ? '暗黑' : '默认' }}
      </NButton>
    </NAffix>
  </NConfigProvider>
```

我们知道 在 App.vue 中有个按钮是用来切换主题颜色的，但是如何在子组件中共享这个 state 呢？可以使用状态管理 vuex、pinia 之类的。这里为了简便使用 **provide 和 inject**

```tsx
// App.vue 中的 script 部分
import { themeInjectionKey } from '@/hoos'

const containerRef = ref<InstanceType<typeof NConfigProvider>>()
const { themeMode, switchDarkTheme } = useTheme()
const { curTheme, isDarkMode } = useGetTheme(themeMode)

provide(themeInjectionKey, themeMode)
```

我们新建一个 hooks 文件，里面有 useTheme，和 useGetTheme

```typescript
import { useLocalStorage, RemovableRef } from '@vueuse/core'
import { computed, inject, InjectionKey, ref } from 'vue'
import { darkTheme } from 'naive-ui'

export enum mode {
  dark,
  default,
}

export const themeInjectionKey: InjectionKey<RemovableRef<number>> =
  Symbol('theme-provider')

export const useTheme = () => {
  const themeMode = useLocalStorage('vue-cms-theme-mode', mode.default)

  const switchDarkTheme = () => {
    themeMode.value =
      themeMode.value === mode.default ? mode.dark : mode.default
  }

  return {
    themeMode,
    switchDarkTheme,
  }
}

export const useGetTheme = (
  themeProp?: RemovableRef<number>,
  theme?: string
) => {
  let themeMode = inject(themeInjectionKey, ref(mode.default))
  if (themeProp) {
    themeMode = themeProp
  }
  const isDarkMode = computed(() => themeMode.value === mode.dark)

  const curTheme = computed(() => {
    if (!theme) {
      return themeMode.value === mode.dark ? darkTheme : undefined
    }
    return undefined
  })

  return {
    themeMode,
    curTheme,
    isDarkMode,
  }
}
```

所以我们就可以在子组件 child.vue 中使用 APP.vue 提供的 state

```tsx
  // child.vue
  const { isDarkMode } = useGetTheme()

  <div class={{'tabs-crumb-dark': isDarkMode}}>child component</div>
```
