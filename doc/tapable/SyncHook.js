/**
 * 同步钩子, 能够同步执行注册的监听函数
 */
class SyncHook {
  constructor(args) {
    this.tasks = []
  }
  call(...args) {
    this.tasks.forEach(task=>task(...args))
  }
  tap(_, task) {
    this.tasks.push(task);
  }
}

module.exports = SyncHook