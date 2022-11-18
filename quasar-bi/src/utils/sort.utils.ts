export namespace SortUtils {
  export function multiArray<T> (baseArray: T[], arrays: any[][], compareFunction?: (a: T, b: T) => number) {
    function swap (leftIndex: number, rightIndex: number) {
      const temp = baseArray[leftIndex]
      baseArray[leftIndex] = baseArray[rightIndex]
      baseArray[rightIndex] = temp

      for (const arr of arrays) {
        const temp = arr[leftIndex]
        arr[leftIndex] = arr[rightIndex]
        arr[rightIndex] = temp
      }
    }

    const cmpFunction = compareFunction ?? ((a: T, b: T) => a < b ? -1 : (a > b ? 1 : 0))

    function partition (left: number, right: number) {
      const pivot = baseArray[Math.floor((right + left) / 2)]
      let i = left // left pointer
      let j = right // right pointer

      while (i <= j) {
        while (cmpFunction(baseArray[i], pivot) === 1) {
          i++
        }
        while (cmpFunction(baseArray[j], pivot) === -1) {
          j--
        }
        if (i <= j) {
          swap(i, j) // sawpping two elements
          i++
          j--
        }
      }
      return i
    }

    function quickSort (left: number, right: number) {
      let index
      if (baseArray.length > 1) {
        index = partition(left, right) // index returned from partition
        if (left < index - 1) { // more elements on the left side of the pivot
          quickSort(left, index - 1)
        }
        if (index < right) { // more elements on the right side of the pivot
          quickSort(index, right)
        }
      }
    }

    quickSort(0, baseArray.length - 1)
  }

  export function getMinMax<T> (array: T[], compareFunction?: (a: T, b: T) => number, baseFunction?: (a: T) => boolean) {
    compareFunction = compareFunction ?? ((a: T, b: T) => a < b ? -1 : (a > b ? 1 : 0))
    if (typeof array[0] === 'number') {
      // @ts-ignore
      baseFunction = baseFunction ?? ((a: number) => a === 0)
    }

    let min: T = array[0]
    let max: T = array[0]
    let minIndex = 0
    let maxIndex = 0

    if (baseFunction !== undefined) {
      // @ts-ignore
      const index = array.findIndex(item => !baseFunction(item))
      min = array[index]
      minIndex = index
    }

    for (let i = 0; i < array.length; i++) {
      if ((baseFunction && !baseFunction(array[i]) && compareFunction(array[i], min) < 0) ||
          (baseFunction === undefined && compareFunction(array[i], min) < 0)) {
        min = array[i]
        minIndex = i
      }

      if (compareFunction(array[i], max) > 0) {
        max = array[i]
        maxIndex = i
      }
    }

    return {
      maxIndex,
      minIndex
    }
  }
}
