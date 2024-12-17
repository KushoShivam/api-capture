const path = require('path');

module.exports = function override(config, env) {
    config.resolve.modules = [
        path.resolve(__dirname, 'src'), // default src directory
        // path.resolve(__dirname, '../..'), // add your external directory
        'node_modules',
    ];
    return config;
};
