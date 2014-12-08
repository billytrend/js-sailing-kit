module.exports = {

    // [int] => [int] => [int]
    addArrays: function(a, b) {
        var sum = [];
        for(var i = 0; i < a.length; i++) {
            sum[i] = a[i] + b[i];
        }
        return sum;
    },

    // [int] => [int] => double(0,1) => int
    moderateArray: function(array, deltas, proportion) {
        partialDeltas = deltas.map(function(e) {
            return e * proportion;
        });
        return this.addArrays(array, partialDeltas);
    },

    // [int] => [int] => double(0,1) => int
    getDeltas: function(sourceArray, targetArray) {
        var deltas = [];
        for(var i = 0; i < sourceArray.length; i++) {
            deltas[i] = sourceArray[i] - targetArray[i];
            deltas[i] = sourceArray[i] > targetArray[i] ? -deltas[i] : deltas[i];
        }
        return deltas;
    }

}