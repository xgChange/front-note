type RemoveCallback<T extends any[]> = (
  item: T[number],
  index: number,
  arr: T
) => boolean

class ArrayList<T extends any[]> {
  constructor(private element: T) {}

  remove(num: number): number
  remove(callback: RemoveCallback<T>): T
  remove(value: any): any {
    if (typeof value === 'number') {
      this.element = this.element.filter((item, index) => index !== value) as T
      return value
    }
    return (this.element = this.element.filter(value) as T)
  }

  show() {
    return this.element
  }
}

const arr = [
  { name: 1, age: 1 },
  { name: 2, age: 2 },
]

const myList = new ArrayList(arr)

// myList.remove((item) => item.age === 1)
myList.remove(0)

console.log(myList.show())
