const CracoLessPlugin = require("craco-less");

module.exports = {
    webpack: {
        configure: {
            resolve: {
                symlinks: true,
            },
        },
    },
    plugins: [
        {
            plugin: CracoLessPlugin,
        }
    ],
};