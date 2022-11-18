export interface IBaseDateValue {
  date: string,
  value: number
}

export namespace MarkupUtils {
  export function calculateAccumulate (raw: IBaseDateValue[]): IBaseDateValue[] {
    for (let i = 0; i < raw.length; i++) {
      if (i > 0) {
        raw[i].value = ((raw[i - 1].value * i) + raw[i].value)/(i + 1)
      }
    }
    return raw
  }
}
