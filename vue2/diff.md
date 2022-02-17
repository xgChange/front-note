# vue的diff过程

> vue3代码 runtime-core/src/renderer.ts， patchChildren函数

原来的vnodes和新生成的vnodes进行对比，diff的过程。

- vue中对于列表的更新操作：
  - 有key值，使用patchKeyedChildren方法
  - 无key值，使用patchUnkeyChildren方法

1. 无key值时： 例如两个数组进行diff比较
   ```javascript
    const a1 = ['a', 'b', 'c']
    const a2 = ['a', 'b', 'd', 'c']
    
    const minLength = Math.min(a1.length, a2.length)

    for(let i = 0; i<minlength; i++) {}  // 找最小的数组进行遍历

    // 1. 每个元素进行对比，如果发现有个元素不同
    // 2. 比较标签类型、内容

    // 如果minLength遍历完了
    // 1. old > new 数组， 则删除old数组后面的项
    // 2. old < new 数组， 则将项mount到新数组后面
   ```

2. 有key值：例如两个数组
   ```javascript
    function isSameVNodeType() { n1.type === n2.type && n1.key === n2.key }
    // 分为5步
    // 1. 从头开始遍历。还是以最小的length进行遍历，当前后两个元素相同时：isSameVNodeType，进行patch。否则跳出循环
    // 2. 从尾部进行遍历。重复1的操作
    // 3. 如果new数组 > old数组，则新增的项就直接mount
    // 4. 如果old数组 < new数组，则多余的项就直接unMount
    // 5. 如果是不相同、不知道的序列，则进行key值查找是否存在，然后patch，就是移动元素的位置。
   ```