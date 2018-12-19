let arg = process.argv[2];

const primeCount = (num) => {
    let isPrime = true;
    for (let i = 2; i < num / 2; i++) {
        if (num % i == 0) {
            isPrime = false;
        }
    }
    isPrime ? console.log('IS prime') : console.log('NOT prime')
}
primeCount(arg);

const arraySorter = (arr1, arr2) => {
    const tempArr = [];
    const tempArr2 = [];
    const outputArr = [];
    const uniqueVals = (input, output) => {
        for (let x in input) {
            let temp = input[x];
            for (let y = input.length - 1; y >= 0; y--) {
                if (input[x] == input[y] && x != y) {
                    temp = null;
                } else if (x == y) {
                    temp = input[x]
                };
            }
            temp ? output.push(temp) : {};

        };
    }
    this.id = uniqueVals;
    console.log(this.id);
    uniqueVals(arr1, tempArr)

    for (let i in tempArr) {
        for (let j in arr2) {
            if (tempArr[i] == arr2[j]) {
                tempArr2.push(tempArr[i])
            }
        }
    }
    uniqueVals(tempArr2, outputArr)

    console.log(outputArr)
}

arraySorter([23423,1, 2, 3, 3, 4, 666, 6, 66, 5, 6, 6], [23423,5, 6, 423, 322, 666, 66, 66, 8, 3, 6, 7, 8])