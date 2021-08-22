const webpack = require('./webpack');
const webpackOptions = require('./webpack.config')

const compiler = webpack(webpackOptions)
debugger


compiler.run((err, stats) => {
  console.log('err', err);
  console.log('stats', stats.toJson({
    entries: true, 
    chunks: true,
    modules: true, // 打包模块的数组
    assets: true, // 本次产出的文件 
  }));
})