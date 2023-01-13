type MyObject = Record<string, any>
type MergeArrType<T extends unknown[]> = T extends [infer O, ...infer P] ? O & MergeArrType<P> : object

function cross<T extends MyObject, P extends MyObject>(o1: T, o2: P): T & P
function cross<T extends MyObject, P extends [MyObject, ...MyObject[]]>(o1: T, ...rest: P): T & MergeArrType<P>
function cross(o1: any, ...rest: any[]): any {
  let obj = {} as MyObject

  const merge = (o1: MyObject, o2: MyObject): MyObject => {
    const result = {} as any
    Object.keys(o1).forEach(key => {
      result[key] = o1[key]
    })
    Object.keys(o2).forEach(key => {
      if (!result.hasOwnProperty(key)) {
        result[key] = o2[key]
      }
    })
    return result
  }

  if (rest.length === 1) {
    obj = merge(o1, rest[0])
  } else {
    let mergeObj = {} as MyObject
    for(let i = 0; i < rest.length; i++) {
      const item = rest[i]
      if (item) {
        mergeObj = merge(mergeObj, item)
      }
    }
    obj = merge(o1, mergeObj)
  }
  return obj
}

const obj1 = {
  name: 'This is name',
  age: 12
}

const obj2 = {
  fn: () => {
    return 1
  },
  msg: 'This is message'
}

const obj3 = {
  foo: () => {
    return 1
  },
  role: [1, 2, 3],
  name: '111'
}

const arr: [MyObject, ...MyObject[]] = [obj1, obj2]

type C = MergeArrType<typeof arr>

const mergeObj = cross(obj1, obj2, obj3)
const mergeObj2 = cross(obj2, obj3)
console.log(mergeObj.role, mergeObj)
console.log(mergeObj2)