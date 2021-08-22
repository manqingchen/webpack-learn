/**
 * 同步熔断保险钩子
 * 当return了一个非undefined的值时,则不再继续执行后面的监听函数
 */
class SyncBailHook {
  constructor(args) {
    this.tasks = [];
  }
  // 发布
  call(...args) {
    let ret;
    let index = 0;
    do{
      ret = this.tasks[index](...args);
      index++;
      // ! 如果 ret 有return 则 ret !== undefined
    } while (ret === undefined && this.tasks.length > index);
  }
  // 订阅
  tap(_,task) {
    this.tasks.push(task)
  }
}
module.exports = SyncBailHook;