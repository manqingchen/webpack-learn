/**
 * 同步串行钩子，会将前一个订阅的返回值，传递给下一个
 */
class SyncWaterfallHook {
  constructor(args){
      // 缓存列表
      this.tasks = [];
      // 定义属性保存将来会给订阅者传递多少个参数
      this.args = args;
  }
  // 用于订阅的方法
  tap(tag, task){
      this.tasks.push(task);
  }
  // 用于发布的方法
  call(...args){
      if(args.length < this.args.length){
          return new Error("参数个数不对");
      }
      args = args.slice(0, this.args.length);

      let [firstTask, ...others] = this.tasks;
      let result = firstTask(...args);
      others.forEach(function (task) {
          result = task(result);
      });
  }
}
module.exports = SyncWaterfallHook;