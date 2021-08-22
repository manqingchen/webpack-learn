let Compiler = require('./Compiler')
const WebpackOptionsApply = require('./WebpackOptionsApply')
let NodeEnvironmentPlugin = require('./node/NodeEnvironmentPlugin')
const webpack = (options) => {
  /**
   * webpack本身逻辑很少
   * ! 核心逻辑都在compiler中
   */
  // ! 2. 声明 compiler (编译器对象)
  let compiler
  // ! 2.1 增加默认参数
  // constructor 中 this.set("context", process.cwd()); 通过这一步给options增加了context属性 拿到 Node.js 进程的当前工作目录
  // options = new WebpackOptionsDefaulter().process(options);   
  compiler = new Compiler(options.context) // 创建一个compiler实例 
  compiler.options = options // 赋一个optinos 属性  。。 通过compiler.options 拿到options
  new NodeEnvironmentPlugin().apply(compiler) // 让这个 compiler 有读写文件的功能
  // ! 挂载配置文件里提供的所有的plugins
  if (options.plugins && Array.isArray(options.plugins)) {
    for (const plugin of options.plugins) {
      // 拿到每个插件  执行 插件中的apply方法
      // * 也就是说  这一步是给所有的插件传递compiler参数  对插件进行注册 
      plugin.apply(compiler)
    }
  }
  // ???? 执行webpack的内置插件
  new WebpackOptionsApply().procress(options, compiler)
  return compiler
}


exports = module.exports = webpack;