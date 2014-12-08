var Promise = require('promise'),
    Helpers = require('./AnimationHelpers.js')

module.exports = {

    // boatState
    setSail: function(boatState, api) {
        return new Promise(function (resolve, reject) {
            var sailPos = api.getSailDegrees(boatState);
            //var deltas = Helpers.getDeltas(sailPos, )

        });
    }
}