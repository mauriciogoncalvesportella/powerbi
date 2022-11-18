export namespace ArrayUtils {
  export function array2cumulative (array: number[]): number[] {
    if (array.length > 0) {
      array.reduce((prev, _, index) => {
        const current = array[index]
        array[index] += prev
        return prev + current
      })
    }
    return array
  }
}
