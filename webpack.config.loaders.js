let path = require('path');

module.exports = function() {
    return [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        },
        {
            test: /\.hbs/,
            loader: 'handlebars-loader?helperDirs[]=' + __dirname + '/helpers'
        },
        {
            test: /\.(jpe?g|png|gif|svg|)$/i,
            loader: 'file?name=images/[hash].[ext]'
        },
        {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            loader: 'file?name=fonts/[hash].[ext]'
        }
    ];
};
