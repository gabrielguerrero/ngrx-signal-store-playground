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
export function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// export function withLoadEntitiesEffectOld<
//   State extends Record<string, unknown>,
//   Signals extends Record<string, Signal<any>>,
//   PreviousMethods extends Record<string, (...args: any[]) => any>,
//   Methods extends Record<string, (...args: any[]) => any>,
//   Entity extends { id: string | number }
// >(
//   getAll: (
//     input: SignalStateUpdate<State> &
//       SignalStoreSlices<State> &
//       Signals &
//       PreviousMethods
//   ) => Observable<Entity[]> // or: Promise<Entity[]>
// ) {
//   return (
//     featureInput: SignalStoreFeatureInput<{
//       state: State;
//       signals: Signals;
//       methods: PreviousMethods;
//     }>
//   ) => {
//     // We could have not use signalStoreFeature to implement this hook and use the feature param types to restrict the
//     // use and unsure a withLoadEntities is before but the type will be more complicated
//     const withEntities1 = withLoadEntities<Entity>();
//     const loadEntitiesFeature =
//       signalStoreFeatureFactory<ReturnType<typeof withEntities1>>();
//     const loadEntitiesFeature1 = loadEntitiesFeature(
//       withState({ a: 1 }), // test this was breaking previous implementation of signalStoreFeatureFactory
//       withMethods(({ setAll, setLoaded }) => ({
//         loadEntities: rxEffect<void>(
//           pipe(
//             tap(() => setLoading()),
//             exhaustMap(() =>
//               getAll({
//                 $update: featureInput.$update,
//                 ...featureInput.slices,
//                 ...featureInput.signals,
//                 ...featureInput.methods,
//               })
//             ),
//             tap((entities) => {
//               setAll(entities);
//               setLoaded();
//             })
//           )
//         ),
//       }))
//     );
//     return loadEntitiesFeature1(featureInput as any);
//   };
// }
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
