let {
  Tapable,
  SyncHook
} = require('tapable')
const path = require('path')
const async = require('neo-async');
const NormalModuleFactory = require('./NormalModuleFactory')
let normalModuleFactory = new NormalModuleFactory();
const Parser = require('./Parser');
const Chunk = require('./Chunk');
const ejs = require('ejs')
let parser = new Parser();
const mainTemplate = require('fs').readFileSync(path.join(__dirname, 'template','main.ejs'), 'utf-8')
const mainRender = ejs.compile(mainTemplate);
class Compilation extends Tapable {
  constructor(compiler) {
    super()
    this.compiler = compiler;// 编译器对象
    this.context = compiler.context;// 根目录
    this.options = compiler.options;// 选项配置
    this.inputFileSystem = compiler.inputFileSystem;// 读文件
    this.outputFileSystem = compiler.outputFileSystem;// 写文件
    this.entries = []; // 入口数组，放所有的入口模块
    this.modules = []; // 模块数组, 放所有的模块
    this._modules = {}; // key是模块Id, 值是模块对象
    this.chunks = [];// 放了所有的代码块
    this.files = [];// 本次编译所有产出文件
    this.assets = {};// 存放生成资源 key 文件名， 值文件内容，
    this.hooks = {
      // 构建完成一个模块后， 触发succeedModule
      succeedModule: new SyncHook(['module']),
      seal: new SyncHook(),
      beforeChunks:new SyncHook(),
      afterChunks: new SyncHook(),
    }
  }

  /**
   * ! 开始编译一个新的入口
   * @param {*} context 根目录
   * @param {*} entry 入口模块的相对路径 
   * @param {*} name 入口的名字
   * @param {*} findcallback 编译完成的回调
   */
  addEntry(context, entry, name, findcallback) {
    console.log('从addEntry开始', );
    // 增加模块chain
    this._addModuleChain(context, entry, name, (err, module) => {
      findcallback(err, module)
    })

  }

  _addModuleChain(context, rawRequest, name, callback) {
    this.createModule({
      context,
      rawRequest,
      name,
      parser,
      resource: path.posix.join(context, rawRequest),
      moduleId: ('./' + path.posix.relative(this.context, path.posix.join(context, rawRequest))) // ./src/index.js
    }, entryModule => this.entries.push(entryModule), callback)
  }

  /**
   * 处理编译模块依赖
   * // ! 模块依赖分析 
   * @param {*} module ./src/index.js
   * @param {*} callback 
   */
  processModuleDependencies(module, callback) {
    // 拿到当前模块的依赖模块
    let dependencies = module.dependencies;
    // console.log('dependencies', dependencies);
    // 递归编译依赖 neo-async 
    // 如果依赖多个模块 能够同时开始执行 所有模块全部编译完成后， 才会调用callback
    // ! /doc/2.js  模拟   async.forEach
    async.forEach(dependencies, (dependency, done) => {
      let { name, context, rawRequest, resource, moduleId } = dependency;
      this.createModule({
        context,
        rawRequest,
        name,
        parser,
        resource,
        moduleId
      }, null, done) // 当前模块编译成功以后走done
    }, callback) // 所有模块编译成功以后走callback
  }
  /**
   * 创建并编译模块信息
   * @param {*} data 模块信息
   * @param {*} addEntry 可选增加入口方法 如果模块是入口模块，如果不是就什么都不做
   * @param {*} callback 编译完成，调用callback
   */
  createModule(data, addEntry, callback) {
    /**
         * 1. 创建模块
         * 2. 打包模块
         */
    // 通过模块工厂创建一个普通模块，entryModule 
    let module = normalModuleFactory.create(data)
    addEntry && addEntry(module) // 如果是入口模块就添加进去
    this.modules.push(module); // 给普通模块数组 添加一个模块 （存放所有的模块）
    this._modules[module.moduleId] = module; // 保存模块对应信息
    const afterBuild = (err, module) => {
      // 大于0说明有依赖
      if (module.dependencies.length > 0) {
        // 处理编译模块的依赖
        this.processModuleDependencies(module, err => {
          callback(err, module)
        })
      } else {
        callback(err, module)
      }
    }
    this.buildModule(module, afterBuild)
  }
  /**
   * 编译模块
   * @param {*} module 要编译的模块
   * @param {*} afterBuild 编译成功后的回调
   */
  buildModule(module, afterBuild) {
    // ! 模块真正的编译逻辑实在module内部完成的
    // ! 调用模块自己的build方法
    module.build(this, (err) => {
      // 走到这里意味着一个module模块已经编译完成了
      this.hooks.succeedModule.call(module);
      afterBuild(err, module);
    })

  }

  /**
   * 把模块封装成代码块
   * 代码块是模块的集合
   * @param {*} callback 
   */
  seal(callback) {
    this.hooks.seal.call();
    this.hooks.beforeChunks.call();// 开始准备生成代码块
    // 默认情况 每个入口会生成一个代码块
    for(const entryModule of this.entries) {
      // 用入口模块组装代码模块
      const chunk = new Chunk(entryModule); // 根据入口模块得到代码块
      this.chunks.push(chunk)
      chunk.modules = this.modules.filter(module => module.name === chunk.name)
    }
    this.hooks.afterChunks.call(this.chunks);
    // 生成代码块之后，生成对应资源
    this.createChunkAssets();
    callback()
  }
  /**
   * 创建chunks资源
   */
  createChunkAssets(){
    for(let i =0;i<this.chunks.length;i++) {
      const chunk = this.chunks[i];
      // 对应webpack.config.js output下的chunkfilenames
      const file = chunk.name + '.js'; // 拿到文件名
      chunk.files.push(file);
      let source = '';
      this.emitAssets(file, source)
    }
  }
  /**
   * 发射资源
   * @param {*} file 文件名
   * @param {*} source 对应源码
   */
  emitAssets(file, source) {
    this.assets[file]= source;
    this.files.push(file);
  }
}

module.exports = Compilation;