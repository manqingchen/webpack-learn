// SingleEntryPlugin 单入口插件  

class SingleEntryPlugin {
  constructor(context, entry, name) {
    this.context = context; // 入口上下文绝对路径
    this.entry = entry; // 入口模块路径 ./src/index.js
    this.name = name; // 入口名字
  }
  apply(compiler) {
    // 监听make钩子 当make钩子触发 执行内部逻辑
    // make 异步并行钩子
    compiler.hooks.make.tapAsync('SingleEntryPlugin', (compilation, cb) => {
      const { context, entry, name } = this;
      // 从这个入口开始编译  编译他和他的依赖
      console.log('SingleEntryPlugin make ~~~ 也就是', );
      console.log('进入compalition内部逻辑', );
      // ! 开始编译一个新的入口， context 根目录， entry 入口文件的相对路径 cb 最终的回调
      compilation.addEntry(context, entry, name, cb)
    })
  }
}

module.exports = SingleEntryPlugin