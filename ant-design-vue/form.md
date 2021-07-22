# AForm组件 (学习antdv源码的记录，v1.7.6, vue 2.x版) 

##  

### 一些utils

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

