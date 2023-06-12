import { computed, effect, Injectable } from '@angular/core';
import { signalStore, withState } from '@ngrx/signals';
const s = signalStore(withState({ count: 0 }));

@Injectable()
export class CounterStore extends signalStore(
  withState({ count: 0 }),
  withState({ co2unt: 0 })
) {
  readonly doubleCount = computed(() => this.count() * 2);

  readonly #logOnCountChange = effect(() => {
    console.log('count changed', this.count());
  });

  increment(): void {
    this.update({ count: this.count() + 1 });
  }

  decrement(): void {
    this.update({ count: this.count() - 1 });
  }
}
