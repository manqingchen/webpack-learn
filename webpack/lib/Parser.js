const babylon = require('babylon');
const { Tapable, SyncBailHook, HookMap } = require("tapable");


class Parser extends Tapable {
  parse(source) {
    return babylon.parse(source, {
      sourceType: 'module', //  源代码是一个模块 
      plugins: ['dynamicImport'] // 支持动态导入 支持import('./xxxx)
    })
  }
  tarverse() {
    
  }
}


module.exports = Parser