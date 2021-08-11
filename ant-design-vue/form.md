# AForm组件 (学习antdv源码的记录，v1.7.6, vue 2.x版) 

## 一些utils

def: 是指取该数据的默认值

```javascript
// 1. 在 @/components/_util/vue-types/index.js，有PropTypes
// 2. 在 @/components/form/Form.jsx
const FormProps = {
    layout: PropTypes.oneOf(['horizontal', 'inline', 'vertical'])
}

const Form = {
    // 目的就是初始化该props的一些默认值
    props: initDefaultProps(FormProps, {
        layout: 'horizontal',
    })
}

// 3. @/components/_util/props_util.js
const initDefaultProps = (propTypes, defaultProps) => {
  Object.keys(defaultProps).forEach(k => {
    if (propTypes[k]) {
        // defaultProps传入，然后为 propTypes[K].default 设置一个默认值， 具体看 def的劫持。
        // 例如以上面那个例子：就是为layout 这个prop设置一个初始值，并挂载default上。
      propTypes[k].def && (propTypes[k] = propTypes[k].def(defaultProps[k]));
    } else {
      throw new Error(`not have ${k} prop`);
    }
  });
  return propTypes;
};

// 4. 劫持def 的代码在 @/components/_util/vue-types/utils.js 的 withDefault函数
```

##  一些属性的说明

$vnode.context 当前上下文作用域(我理解的是外层，调用组件的作用域，this)

$vnode.VNodeData用来描述一个组件。

```jsx
// 例如一个 MyComponent
<MyComponent @some-event="handler" prop-a="1" /> // 如果有指令下面也会显示指令的信息
    
// 对应的VNodeData
{
    on: {
        'some-event': handler
    },
    propA: '1'
}
```

## 为什么element-ui 是通过递归方式查找子、父组件，进行事件通信？

**我暂时理解的是，因为element-ui是通过.vue文件写的，父组件无法在插槽上进行监听事件。***

**而antd是用jsx写的，更加灵活，可以操作子组件的VNode。**

```javascript
// 例如 在antd的form组件中（model双向绑定），在form-item阶段就对子VNode进行了v-model的绑定。
on: {
  blur: (...args) => {
    originalBlur && originalBlur(...args);
    this.onFieldBlur();
  },
  change: (...args) => {
    if (Array.isArray(originalChange)) {
      for (let i = 0, l = originalChange.length; i < l; i++) {
        originalChange[i](...args);
      }
    } else if (originalChange) {
      originalChange(...args);
    }
    this.onFieldChange();
  },
},
// 将上面这个props传入到了子VNode中，这样就可以 类似于 对slot进行监听事件。 而在子组件中只要this.$emit就好了
```

