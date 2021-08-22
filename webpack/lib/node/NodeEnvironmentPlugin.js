// ? 核心功能就是 给webpack提供读写文件的能力

const fs = require('fs');

class NodeEnvironmentPlugin {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    // ! 1. 创建控制台日志  
    // ! 2. 读文件系统 fs.readFile
    compiler.inputFileSystem = fs;
    // ! 3. 写文件系统 fs.writeFile
    compiler.outputFileSystem = fs;
    // ! 4. 运行之前先进行清除
    // compiler.hooks.beforeRun.tap('NodeEnvironmentPlugin', compiler => {
    //   if (compiler.inputFileSystem === inputFileSystem) inputFileSystem.purge()
    // })
  }
}

module.exports = NodeEnvironmentPlugin;