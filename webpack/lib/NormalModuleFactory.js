const NormalModule = require('./NormalModule')

/**
 * 普通模块工厂
 */
class NormalModuleFactory{
  create(data) {
    return new NormalModule(data)
  }
}


module.exports = NormalModuleFactory