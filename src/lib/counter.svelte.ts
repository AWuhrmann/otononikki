
export class CounterState {
    value = $state(0);

    constructor(intialValue = 0) {
        this.value = intialValue;
    }

    increment() {
        this.value += 1
    }

    decrement() {
        this.value -= 1
    }

    reset() {
        this.value = 0
    }

    save() {
        console.log('saving', this.value);
    }


}