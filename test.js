let arg = process.argv[2];

const fib = () => {
    currentFib = 0;
    nextFib = 1;
    for (i = 0; i < arg; i++) {
        temp = nextFib;
        nextFib = currentFib + nextFib;
        currentFib = temp;
    }
    console.log(nextFib)
}
fib()