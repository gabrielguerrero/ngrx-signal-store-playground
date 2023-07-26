import { signalStoreFeature, type } from './lib/signal-store-feature';
import { withState } from '@ngrx/signals';

function withFoo() {
  return withState({ foo: 'foo' });
}

function withBar() {
  return signalStoreFeature(
    { input: { state: type<{ foo: string }>() } },
    withState({ bar: 'bar' })
  );
}

function withBazWorks() {
  return signalStoreFeature(withFoo(), withState({ count: 0 }), withBar());
}

function withBazDoesNotWork() {
  let f3 = withBar();
  let f1 = withFoo();
  return signalStoreFeature(
    // withFoo(), // is replaced with withState({ foo: 'foo' })
    withState({ foo: 'foo' }),
    withState({ count: 0 }),
    withBar()
  );
}
