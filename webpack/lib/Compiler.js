
const {
  Tapable,
  AsyncSeriesHook,
  SyncBailHook,
  AsyncParallelHook,
  SyncHook,
} = require('tapable');
const Compilation = require('./Compilation');
const NormalModuleFactory = require('./NormalModuleFactory');
const Stats = require('./Stats');
const mkdirp = require('mkdirp');// 递归创建新的文件夹
const path = require('path');
class Compiler extends Tapable {
  // 编译器对象
  constructor(context) {
    super()
    this.context = context;
    // ! tapable 钩子语法一般是  new XXXHook(['a','b','c'])  
    // ! a,b,c 指的是 钩子触发时传参的参数名  
    // ! 比如 this.hooks.make.call('compilation')
    // ! 比如 this.hooks.entryOption.call('a','b')
    this.hooks = {
      /** @type {AsyncParallelHook<Compilation>} */
      // 异步并行钩子
      make: new AsyncParallelHook(["compilation"]),
      // done: new AsyncSeriesHook(['stats']), // 编译完成之后回触发这个钩子
      /** @type {SyncBailHook<string, Entry>} */
      // context 项目根目录  /Users/imac/Desktop/webpack/。
      // entry 入口文件的路径 --> 相对于根目录 /src/index.js
      // 拼起来就是绝对路径
      entryOption: new SyncBailHook(["context", "entry"]),// 入口配置文件
      beforeRun: new AsyncSeriesHook(["compiler"]), // 运行前
      run: new AsyncSeriesHook(["compiler"]),// 运行
      beforeCompile: new AsyncSeriesHook(["params"]),// 编译前
      compile: new SyncHook(["params"]),// 开始编译
      make: new AsyncParallelHook(["compilation"]),// make构建  make是compile的一部分 //TODO
      thisCompilation: new SyncHook(["compilation", "params"]),// 开始一次新的编译 make的时候会触发
      compilation: new SyncHook(["compilation", "params"]),// 创建完成一个新的compilation make的时候会触发
      afterCompile: new AsyncSeriesHook(["compilation"]),// 编译完成
      emit: new AsyncSeriesHook(["compilation"]), // 发射｜写入
      done: new AsyncSeriesHook(["stats"]), // 所有编译全部完成
    }
  }
  // ! run方法是开始编译的入口
  run(callback) {
    console.log('Compiler run ---->>>> ',);

    // 编译完成后  最终的回调函数
    const findCallback = (err, stats) => {
      callback(err, stats)
    }
    const onCompiled = (err, compilation) => {
      
      // findCallback(err, new Stats(conpilation));
      // 把chunk变成文件写入硬盘
      const emitFiles = (err) => {
        
      }
      // 先触发 emit 钩子 （emit）是修改输出的最后机会
      this.hooks.emit.callAsync(compilation,() => {
        // 先创建dist目录， 再写入文件
        mkdirp(this.options.output.path, emitFiles)
      })
    }

    // run运行前
    this.hooks.beforeRun.callAsync(this, err => {
      // run运行时
      this.hooks.run.callAsync(this, err => {
        // ! 开始编译
        this.compile(onCompiled)
      })
    })
  }

  compile(onCompiled) {
    // 1. 构建参数
    const params = this.newCompilationParams();

    // beforeCompoliler
    this.hooks.beforeCompile.callAsync(params, err => {
      this.hooks.compile.call(params);
      // 创建一个新的  compilation 对象
      const compilation = this.newCompilation(params);
      // 触发make钩子的回调函数执行，
      // ! 调用 this.hooks.make 进行监听   执行的时候 会执行 SingleEntryPlugin 中的方法
      this.hooks.make.callAsync(compilation, err => {
        console.log('从SingleEntryPlugin 进入单入口插件 MMMMmake完成 ',);
        console.log(`  compilation 中处理模块，编译模块后\n执行compilation.seal方法 把模块封装成代码块\n生成对应chunk资源
        `, );
        compilation.seal(err=> {
          // 封装代码块后编译完成
          this.hooks.afterCompile.callAsync(compilation,(err)=> {
            onCompiled(err, compilation);
          })
        })
      })
    })
  }

  // 生成参数
  newCompilationParams() {
    const params = {
      // 在compilation之前已经创建了一个普通模块工厂（用来创建普通模块
      normalModuleFactory: new NormalModuleFactory(), // TODO
      // contextModuleFactory: this.createContextModuleFactory(),
      compilationDependencies: new Set()
    };

    return params;
  }

  // 生成一个新的 compilation
  newCompilation(params) {
    const compilation = this.createCompilation()
    this.hooks.thisCompilation.call(compilation, params)
    this.hooks.compilation.call(compilation, params)
    return compilation;
  }

  // 生成 Compilation 的实例
  createCompilation() {
    // 直接返回Compilation实例
    // 传入的this 就是 Compiler
    return new Compilation(this);
  }

  
}

module.exports = Compiler