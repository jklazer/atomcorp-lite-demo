(function(root) {
  'use strict';
  const phone = value => String(value || '').replace(/\D/g,'').replace(/^8(?=\d{10}$)/,'7');
  const duplicatePairs = leads => {
    const seen = new Map(), pairs = [];
    for (const lead of leads.filter(l=>!l.mergedInto)) {
      const key = phone(lead.phone);
      if (!key) continue;
      if (seen.has(key)) pairs.push([seen.get(key),lead]); else seen.set(key,lead);
    }
    return pairs;
  };
  const record = (state,text) => state.log.unshift({text,time:new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})});
  function merge(state, masterId, donorId) {
    const master=state.leads.find(l=>l.id===masterId), donor=state.leads.find(l=>l.id===donorId);
    if (!master || !donor || master===donor || master.mergedInto || donor.mergedInto || !phone(master.phone) || phone(master.phone)!==phone(donor.phone)) throw Error('Объединение недоступно');
    master.notes=[...new Set([...(master.notes||[]),...(donor.notes||[])])];
    donor.mergedInto=master.id;
    record(state,`Гигиенист: дубль #${donor.id} объединён с #${master.id}. Подтверждено человеком.`);
  }
  function completeTask(state,id) {
    const task=state.tasks.find(t=>t.id===id);
    if (!task || task.done) return;
    task.done=true; record(state,`Выполнена задача «${task.title}»`);
  }
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const api={duplicatePairs,merge,completeTask,record,escape};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else root.DemoCore=api;
})(globalThis);
