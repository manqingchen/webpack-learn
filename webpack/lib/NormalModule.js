const path = require('path');
const types = require('babel-types');
const generator = require('babel-generator').default; // 语法书--> 代码 
const traverse = require('babel-traverse').default;// 遍历语法树
// 创建普通模块
class NormalModule {
  constructor({ name, context, rawRequest, resource, parser, moduleId }) {
    this.name = name;
    this.context = context;
    this.rawRequest = rawRequest;
    this.resource = resource;// 模块的绝对路径
    // AST解析器 把源代码转换成抽象语法树 
    this.parser = parser; // 解析器 babel 。。。。
    this._source; // 模块对应源代码
    this._ast; // 模块对应ast抽象语法树
    this.dependencies = []// 当前模块依赖的模块信息
    this.moduleId = moduleId || ('./' + path.posix.relative(this.context, resource));
  }

  /**
   * ! 编译模块
   * @param {*} Compilation 编译对象
   * @param {*} callback 回调函数
   */
  build(compilation, callback) {
    // console.log('this._source', this._source);
    this.doBuild(compilation, err => {
      // 这里拿到ast语法树
      this._ast = this.parser.parse(this._source);
      // 编译语法树，收集依赖
      traverse(this._ast, {
        // 当遍历到CallExpression（调用表达式）节点时， 就会进入回调
        CallExpression: (nodePath) => {
          let node = nodePath.node;// 获取节点
          // 如果方法名是一个require方法
          if (node.callee.name == 'require') {
            // 把方法名从require改成__webpack_require__
            node.callee.name = '__webpack_require__';
            // 模块名称
            let moduleName = node.arguments[0].value;
            // 获取了可能的文件扩展名(是否有后缀.js 如果没有就加上)
            let extName = moduleName.split(path.posix.sep).pop().indexOf('.') == -1 ? '.js' : '';
            // 获取依赖模块(./src/index.js)的绝对路径
            let depResource = path.posix.join(path.posix.dirname(this.resource), moduleName + extName)
            // 获取依赖的模块ID 从根目录出发 到依赖模块的绝对路径和相对路径
            let depModuleId = './' + path.posix.relative(this.context, depResource);
            node.arguments = [types.stringLiteral(depModuleId)] // 把require模块路径从./title.js 变成 ./src/title.js
            this.dependencies.push({
              name: this.name, // main
              context: this.context, // 根目录
              rawRequest: moduleName, // 模块相对路径 原始路径
              moduleId: depModuleId, // 模块ID 相对于根目录的相对路径 以./开头
              resource: depResource // 依赖模块的绝对路径
            })
          }
        }
      })
      // 把转换后的语法树重新生成源代码
      let { code } = generator(this._ast)
      this._source = code;
      callback();
    });
  }

  /**
   * 1. 读取模块代码
   * 2. // ! 处理loader逻辑
   * @param {*} compilation 
   * @param {*} callback 
   */
  doBuild(compilation, callback) {
    // 这里读取到模块代码
    this.getSource(compilation, (err, source) => {
      // 存放原始代码到当前模块的_source中 调用callback
      this._source = source;
      callback();
    }); // 获取源代码
  }

  /**
   * 读取真正的源代码
   */
  getSource(compilation, callback) {
    // 这里使用fs模块读文件
    compilation.inputFileSystem.readFile(this.resource, 'utf-8', callback)
  }
}

module.exports = NormalModule


/**
 * 1. 从硬盘上把模块读出来，读成一个文本
 * 2. 可能不是一个js模块， 所以可能会经过loader进行模块转换， 最终肯定得到一个js模块， 得不到就报错
 * 3. 把这个js模块代码 经过parser处理转换成抽象语法树AST
 * 4. 分析AST里的依赖， 也就是找到 require import 分析依赖模块
 * 5. 递归编译依赖模块
 * 6. 不停的一次执行上面5步 直到编译完成✅
 */

/**
 * 模块ID问题
 */