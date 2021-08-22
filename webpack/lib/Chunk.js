
class Chunk {
  constructor(entryModule) {
    this.entryModule = entryModule;// 代码块的入口模块
    this.name = entryModule.name;
    this.files = []; // 代码生成了那些文件
    this.modules = []; // 代码块包含哪些模块
  }
}

module.exports = Chunk