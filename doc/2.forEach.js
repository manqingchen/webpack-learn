
let arr = [1,2,3,4,5];

function forEach(arr, callback, finalCallback){
  let total = arr.length;
  function done() {
    if(--total ===0) {
      finalCallback()
    }
  }
  arr.forEach(item=> {
    callback(item ,done)
  })
}
forEach(arr, (item, done) => {
console.log('item', item);
done()
}, () => {
  console.log('done', );
})