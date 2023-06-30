export function toMap<T>(
  a: Array<T>,
  selectId: (item: T) => string | number = (item) => (item as any).id
) {
  return a.reduce((acum: { [key: string]: T }, value) => {
    acum[selectId(value)] = value;
    return acum;
  }, {}) as { [key: string]: T };
}
export function insertIf<T>(condition: any, getElement: () => T): T[] {
  return condition ? [getElement()] : [];
}
