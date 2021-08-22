const EntryOptionPlugin = require("./EntryOptionPlugin")

/**
 *  ! 挂载各种各样的内置插件
 */
class WebpackOptionsApply{
  procress(options, compiler) {
    // 注册插件
    new EntryOptionPlugin().apply(compiler);
    // 触发EntryOption 
    // 钩子 context 也就是根目录的路径 
    // entry 就是入口 './src.index.js'
    // ! 这个插件用来读入口文件
    compiler.hooks.entryOption.call(options.context,  options.entry)
  }
}

module.exports = WebpackOptionsApply