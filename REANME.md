## 执行流程
1. webpack接受options 创建compiler实例;
2. 创建node环境 赋予webpak读写能力;
3. 挂载配置文件中提供的默认插件
4. 初始化选项，挂载webpack内置插件

## plugin 是贯穿整个生命周期的
plugin分两步进行
- 注册  
- 触发
刚开始就注册了， 但是并没有触发执行。 在执行编译的过程中 逐渐执行
## loader 是其中一个小环节


> 类似发布订阅  在适当的时机 执行plugin


## tapable
1. SyncHook 同步钩子, 能够同步的执行注册的监听函数
2. SyncBailHook 同步熔断保险钩子, 当return了一个非undefind的值, 则不再继续执行后面的监听函数。