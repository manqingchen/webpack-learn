const SyncHook = require('./SyncHook')
const SyncBailHook = require('./SyncBailHook')
const AsyncSeriesHook = require('./AsyncSeriesHook')
class Test {
  constructor() {
    this.hooks = {
      run: new SyncHook(['go']),
      SyncBailHook: new SyncBailHook('go'),
    }
    this.initHook();
    this.initBailHook();
  }
  initHook() {
    this.hooks.run.tap('run', e => console.log(e))
    this.runHook()
  }
  initBailHook() {
    this.hooks.SyncBailHook.tap('SyncBailHook1', e => {
      console.log(e);
      return '停止向下';
    })
    this.hooks.SyncBailHook.tap('SyncBailHook2', e => console.log(e))
    this.runBail()
  }
  runHook() {
    this.hooks.run.call('SyncHook~~~')
  }
  runBail() {
    this.hooks.SyncBailHook.call('SyncBailHook~~~')
  }
}

new Test()

module.exports = {
  SyncHook,
  SyncBailHook,
  AsyncSeriesHook
}