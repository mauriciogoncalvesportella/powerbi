export interface IImportData<T> {
  has: (cd: number) => Promise<T>,
  importData: (entities: T[]) => Promise<void>,
}
