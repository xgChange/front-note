# AButton组件 (学习antdv源码的记录，v1.7.6, vue 2.x版) 

## AButton

antd中也提供了一个类似于react的provider组件 **ConfigProvider**,就是对于**provide/inject**的封装.

在AButton中有个**inject**选项

```javascript
// 里面的default，若父组件没提供configProvider，则值是default（若是引用类型需要使用工厂函数）
inject: {
  configProvider: { default: () => ConfigConsumerProps },
},
```

在@/components/_utils/props-utils.js，**getComponentFromProp**函数，主要就是指定传入的props、slot进行render - **props render**。

```javascript
// 截取getComponentFronProp部分代码，最终返回结果是一个VNode

if (instance.$createElement) {
    const h = instance.$createElement;
    const temp = instance[prop];
    if (temp !== undefined) {
      return typeof temp === 'function' && execute ? temp(h, options) : temp; // 将h 传入render函数
    }
    return (
      (instance.$scopedSlots[prop] && execute && instance.$scopedSlots[prop](options)) ||
      instance.$scopedSlots[prop] ||
      instance.$slots[prop] ||
      undefined
    );
}

// 处理slots, 因为slotScope 返回里面的属性的值是 一个render函数
if (slotScope !== undefined) {
  return typeof slotScope === 'function' && execute ? slotScope(h, options) : slotScope;
}
```

**有点不太懂，为什么在antd组件内的this是一个proxy对象，而组件调用时ref获取的却是vc对象**