export namespace NumberUtils {
  export function number2thousand (num: number | string): string {
    const n: number = Math.abs(typeof num === 'string' ? parseInt(num) : num)

    let formatted = ''
    let magnitude = ''

    if (n < 1e3) {
      formatted = n.toFixed(1)
      magnitude = ''
    } else if (n < 1e6) {
      formatted = (Math.trunc(n * 10 / 1e3) / 10).toString()
      magnitude = 'K'
    } else if (n < 1e9) {
      formatted = (Math.trunc(n * 100 / 1e6) / 100).toString()
      magnitude = 'M'
    }

    if (formatted.slice(-1) === '0') {
      formatted = formatted.split('.')[0]
    }

    return `${formatted}${magnitude}`
  }

  export function number2currency (num: number | string, simple: boolean = false) {
    const n: number = num != null
      ? typeof num === 'string' ? parseInt(num) : num
      : 0

    if (simple) {
      return n.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }).replace('R$', '')
    }

    return n.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
  }

  export function isNotZero (x: any | null): boolean {
    if (x == null) {
      return false
    }

    let n: number = 0
    if (typeof x === 'string') {
      n = parseInt(x)
    } else if (typeof x === 'number') {
      n = x
    } else {
      n = 0
    }

    return n !== 0
  }
}
