const {test} = require('node:test');
const assert = require('node:assert/strict');
const core = require('../src/core.js');
test('finds formatted Russian phone duplicates, excludes empty phones and merged records', () => {
  const leads = [{id:1,phone:'+7 (900) 100-20-30'},{id:2,phone:'8 900 1002030'}, {id:3,phone:''},{id:4,phone:''},{id:5,phone:'89001002030',mergedInto:1}];
  assert.deepEqual(core.duplicatePairs(leads).map(p=>p.map(x=>x.id)),[[1,2]]);
});
test('merge keeps survivor, both notes and original records, repeated merge is refused', () => {
  const state = {leads:[{id:1,phone:'89001002030',notes:['first']},{id:2,phone:'+79001002030',notes:['second']}],log:[]};
  core.merge(state,1,2);
  assert.deepEqual(state.leads[0].notes,['first','second']);
  assert.equal(state.leads[1].mergedInto,1);
  assert.equal(state.leads.length,2);
  assert.throws(()=>core.merge(state,1,2));
});
test('refuses merging records without a matching phone', () => {
  const state={leads:[{id:1,phone:'1'},{id:2,phone:'2'}],log:[]};
  assert.throws(()=>core.merge(state,1,2));
  assert.equal(state.leads[1].mergedInto,undefined);
});
test('completing a task twice produces only one log entry', () => {
  const state={tasks:[{id:1,done:false,title:'Call'}],log:[]};
  core.completeTask(state,1); core.completeTask(state,1);
  assert.equal(state.tasks[0].done,true); assert.equal(state.log.length,1);
});
test('escapes record and chat text before HTML insertion', () => {
  assert.equal(core.escape('<img onerror="x"> &'), '&lt;img onerror=&quot;x&quot;&gt; &amp;');
});
