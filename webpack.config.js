var path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js',
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  plugins: [new VueLoaderPlugin()], //, new BundleAnalyzerPlugin()],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.sass$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader?indentedSyntax',
          'postcss-loader',
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          // loaders: {
          //   // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
          //   // the "scss" and "sass" values for the lang attribute to the right configs here.
          //   // other preprocessors should work out of the box, no loader config like this necessary.
          //   scss: [
          //     'vue-style-loader',
          //     'css-loader',
          //     'sass-loader',
          //     'postcss-loader',
          //   ],
          //   sass: [
          //     'vue-style-loader',
          //     'css-loader',
          //     'sass-loader?indentedSyntax',
          //     'postcss-loader',
          //   ],
          // },
        },
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
        },
      },
    ],
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js',
    },
    extensions: ['*', '.js', '.vue', '.json'],
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
  },
  devtool: '#eval-source-map',
}
