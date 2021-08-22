let SingleEntryPlugin = require('./SingleEntryPlugin')

/**
 * @param {string} context context path
 * @param {EntryItem} item entry array or single path
 * @param {string} name entry key name
 * @returns {SingleEntryPlugin | MultiEntryPlugin} returns either a single or multi entry plugin
 */
 const itemToPlugin = (context, item, name) => {
	if (Array.isArray(item)) {
		return new MultiEntryPlugin(context, item, name);
	}
  // 单入口插件
	return new SingleEntryPlugin(context, item, name);
};

//TODO webpack5 支持入口传一个function

class EntryOptionPlugin {
  apply(compiler) { 
    compiler.hooks.entryOption.tap('EntryOptionPlugin', (context, entry) => {
       itemToPlugin(context, entry, 'main').apply(compiler)
    })
  }
}

module.exports = EntryOptionPlugin