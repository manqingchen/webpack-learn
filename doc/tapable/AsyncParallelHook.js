/**
 * 异步并行钩子，不过方法变了，要使用tapAnysc订阅，callAnysc发布
 */
// 定义一个类作为发布者
class AsyncParallelHook {
  constructor(args){
      // 缓存列表
      this.tasks = [];
      // 定义属性保存将来会给订阅者传递多少个参数
      this.args = args;
  }
  // 用于订阅的方法
  tapAsync(tag, task){
      this.tasks.push(task);
  }
  // 用于发布的方法
  callAsync(...args){
      if(args.length < this.args.length){
          return new Error("参数个数不对");
      }
      args = args.slice(0, this.args.length + 1);
      // 1.取出监听的回调函数
      let finalTask = args.pop();
      // 2.定义一个回调函数
      let index = 0;
      let done = () => {
          index++;
          // 判断回调函数执行的次数是否等于订阅函数的个数
          if(index === this.tasks.length){
              // 执行监听的回调函数
              finalTask();
          }
      };
      // 2.遍历执行所有的订阅函数
      this.tasks.forEach(function (task) {
          task(...args, done);
      })
  }
}
module.exports = AsyncParallelHook;