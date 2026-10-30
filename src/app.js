(() => {
  'use strict';
  const C=window.DemoCore, e=C.escape, key='atomcorp-lite-demo-v1';
  let state=window.createDemo(), view='overview', filter='all', pendingPair=null;
  try { const saved=JSON.parse(localStorage.getItem(key)); if(saved && Array.isArray(saved.leads) && Array.isArray(saved.tasks) && Array.isArray(saved.log) && Array.isArray(saved.messages)) state=saved; } catch { /* Storage may be unavailable for local files. */ }
  const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
  const active=()=>state.leads.filter(l=>!l.mergedInto);
  const neglected=()=>active().filter(l=>l.stage!=='Успешно'&&l.idle>=5);
  const pairs=()=>C.duplicatePairs(state.leads);
  const openTasks=()=>state.tasks.filter(t=>!t.done);
  function save(){ try{localStorage.setItem(key,JSON.stringify(state));}catch{notify('Изменения доступны до закрытия страницы: сохранение браузером недоступно.');} }
  let noticeTimer;
  function notify(text){const node=document.querySelector('#notice');node.textContent=text;node.style.display='block';clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>node.style.display='none',4500);}
  const agents=()=>`<div class="agent-grid">${[
    ['◈','Гигиенист','Сопоставляет телефоны, находит дубли и предлагает объединение.',`${pairs().length} пар дублей`],
    ['↗','Координатор','Находит обращения без движения и готовит задачи менеджерам.',`${neglected().length} лида без внимания`],
    ['◫','Аналитик','Собирает факты из общего состояния CRM и формирует сводку.',`${active().length} активных карточек`]
  ].map(([icon,name,description,result])=>`<article class="panel agent-card"><div class="agent-icon">${icon}</div><h3>${name}</h3><p>${description}</p><span class="badge ${state.hasRun?'ok':''}">${state.hasRun?result:'Ожидает запуска'}</span></article>`).join('')}</div>`;
  const stats=()=>`<div class="stats">${[
    ['В работе',active().filter(l=>l.stage!=='Успешно').length,'лидов в открытой воронке'],
    ['Выручка',money(active().filter(l=>l.stage==='Успешно').reduce((s,l)=>s+l.amount,0)),'по успешным сделкам'],
    ['Дубли',pairs().length,'пар для проверки'],
    ['Без внимания',neglected().length,'лида без касания ≥ 5 дней']
  ].map(([label,value,caption])=>`<article class="stat"><span>${label}</span><strong>${value}</strong><small>${caption}</small></article>`).join('')}</div>`;
  function attention(){
    if(!state.hasRun) return '<p class="empty">Запустите проверку: агенты подготовят предложения по текущим карточкам.</p>';
    return pairs().map(([a,b])=>`<div class="row"><div><span class="badge warn">ГИГИЕНИСТ</span><h3 style="margin-top:9px">Возможный дубль: ${e(a.company)}</h3><p>#${a.id} и #${b.id} · совпадает телефон · заметки сохранятся</p></div><button data-merge="${a.id},${b.id}">Проверить</button></div>`).join('')+
      neglected().map(l=>{const exists=state.tasks.some(t=>t.leadId===l.id);return `<div class="row"><div><span class="badge">КООРДИНАТОР</span><h3 style="margin-top:9px">${e(l.company)} ждёт ${l.idle} дней</h3><p>${e(l.owner)} · ${money(l.amount)} · нет новых касаний</p></div><button data-task="${l.id}" ${exists?'disabled':''}>${exists?'Задача создана':'Создать задачу'}</button></div>`;}).join('') || '<p class="empty">Новых предложений нет. Все найденные вопросы разобраны.</p>';
  }
  const logPanel=()=>`<section class="panel"><div class="panel-head"><h2>История действий</h2><span class="badge">${state.log.length} событий</span></div>${state.log.slice(0,12).map(l=>`<div class="log"><time>${e(l.time)}</time>${e(l.text)}</div>`).join('')||'<p class="empty">Здесь появятся результаты проверок и подтверждённые действия.</p>'}</section>`;
  const funnel=()=>`<section class="panel"><h2>Воронка</h2><p class="muted">Текущие карточки, без объединённых дублей</p>${['Новый','Переговоры','КП отправлено','Успешно'].map(stage=>{const count=active().filter(l=>l.stage===stage).length;return `<div class="bar-row"><div class="bar-label"><span>${stage}</span><strong>${count}</strong></div><div class="bar"><i style="width:${count/Math.max(active().length,1)*100}%"></i></div></div>`;}).join('')}</section>`;
  function chat(){return `<section class="panel"><div class="panel-head"><div><h2>Поручение команде</h2><p>Координатор выбирает сценарий и собирает ответы агентов.</p></div><span class="badge">СЦЕНАРНЫЙ РЕЖИМ</span></div><div class="chat-messages" aria-live="polite">${state.messages.length?state.messages.map(m=>`<div class="message ${m.role==='user'?'user':''}"><b>${m.role==='user'?'ВЫ':'КООРДИНАТОР'}</b>${e(m.text)}</div>`).join(''):'<div class="message"><b>КОМАНДА ГОТОВА</b>Попросите проверить базу, найти дубли или показать сводку. Изменения применяются через отдельные кнопки подтверждения.</div>'}</div><form id="chat-form" class="chat-form"><input id="prompt" aria-label="Поручение агентам" placeholder="Например: проверь базу и покажи проблемы" required maxlength="500"><button class="primary" type="submit">Отправить</button></form><div class="prompts">${['Проверь базу','Найди дубли','Кому нужна задача?','Покажи сводку'].map(p=>`<button data-prompt="${p}">${p}</button>`).join('')}</div></section>`;}
  function render(){
    const titles={overview:['Сначала внимание.<br>Потом действие.','Агенты находят проблемы. Вы выбираете следующий шаг.'],agents:['Одна команда.<br>Три специализации.','Общие данные, понятные предложения и история каждого действия.'],leads:['База без<br>потерянного контекста.','Карточки, повторы и история контакта в одном месте.'],tasks:['У каждого шага<br>есть ответственный.','Задачи создаются из предложений агентов по вашему подтверждению.']};
    document.querySelector('#page-title').innerHTML=titles[view][0];document.querySelector('#page-description').textContent=titles[view][1];
    document.querySelector('#breadcrumb').textContent='Рабочее пространство / '+({overview:'Обзор',agents:'Команда агентов',leads:'Лиды и дубли',tasks:'Задачи'})[view];
    document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    const proposals=`<section class="panel"><div class="panel-head"><div><h2>Требует внимания</h2><p>Предложения агентов · решения остаются за вами</p></div><span class="badge warn">${state.hasRun?pairs().length+neglected().length:'—'}</span></div>${attention()}</section>`;
    let html='';
    if(view==='overview')html=stats()+`<div class="columns"><div>${proposals}${chat()}</div><div>${funnel()}${logPanel()}</div></div>`;
    if(view==='agents')html=agents()+`<section class="panel"><h2>Как проходит поручение</h2><p class="muted">В этой демке роли запускаются последовательно, без вызова языковой модели.</p><div class="pipeline"><span>Ваш запрос</span>→<span>Координатор</span>→<span>Проверки специалистов</span>→<span>Предложения</span>→<span>Подтверждение</span></div></section><div class="columns"><div>${chat()}</div><div>${proposals}${logPanel()}</div></div>`;
    if(view==='leads'){
      const records=filter==='duplicates'?pairs().flat():filter==='history'?state.leads.filter(l=>l.mergedInto):active();
      html=`<section class="panel"><div class="filters">${[['all','Все лиды'],['duplicates','Возможные дубли'],['history','Объединённые']].map(([id,label])=>`<button data-filter="${id}" class="${filter===id?'selected':''}">${label}</button>`).join('')}</div><div class="table-wrap"><table><thead><tr><th>Контакт / компания</th><th>Телефон</th><th>Статус</th><th>Сумма</th><th>Ответственный</th></tr></thead><tbody>${records.map(l=>`<tr><td><strong>${e(l.name)}</strong><small>#${l.id} · ${e(l.company)}</small></td><td>${e(l.phone)}</td><td><span class="badge ${l.stage==='Успешно'?'ok':''}">${l.mergedInto?'Объединён с #'+l.mergedInto:e(l.stage)}</span></td><td>${money(l.amount)}</td><td>${e(l.owner)}</td></tr><tr><td colspan="5" class="muted">${(l.notes||[]).map(e).join(' · ')}</td></tr>`).join('')}</tbody></table>${records.length?'':'<p class="empty">Таких карточек пока нет.</p>'}</div></section>${proposals}`;
    }
    if(view==='tasks')html=`<section class="panel"><div class="panel-head"><h2>Задачи команды</h2><span class="badge">${openTasks().length} открыто</span></div>${state.tasks.map(t=>`<div class="row"><div><h3 class="${t.done?'task-done':''}">${e(t.title)}</h3><p>${e(t.owner)} · лид #${t.leadId}</p></div><button data-complete="${t.id}" ${t.done?'disabled':''}>${t.done?'Выполнено':'Завершить'}</button></div>`).join('')}</section>${proposals}${logPanel()}`;
    document.querySelector('#content').innerHTML=html;
  }
  function runAudit(){state.hasRun=true;C.record(state,`Гигиенист: ${pairs().length} пар дублей. Координатор: ${neglected().length} лида без внимания. Аналитик: сводка обновлена.`);save();render();notify('Проверка завершена. Предложения готовы.');}
  function reply(text){
    state.messages.push({role:'user',text});
    const q=text.toLowerCase();let answer;
    if(/провер|проблем|аудит/.test(q)){runAudit();answer=`Проверку выполнили три агента.\nГигиенист: найдено пар дублей — ${pairs().length}.\nКоординатор: без внимания — ${neglected().length} лида.\nАналитик: ${active().length} карточек, открытых задач — ${openTasks().length}.\nПроверьте предложения в блоке «Требует внимания». Без вашего подтверждения карточки не изменяются.`;}
    else if(/дубл|повтор/.test(q)){state.hasRun=true;answer=pairs().length?pairs().map(([a,b])=>`Гигиенист: #${a.id} и #${b.id}, «${a.company}». Совпадает телефон. Предлагаю проверить и объединить карточки, сохранив заметки.`).join('\n'):'Гигиенист: совпадений телефона среди активных карточек нет.';}
    else if(/задач|забыт|вниман/.test(q)){state.hasRun=true;answer='Координатор:\n'+neglected().map(l=>`«${l.company}» — ${l.idle} дней без касаний. Ответственный: ${l.owner}. ${state.tasks.some(t=>t.leadId===l.id)?'Задача уже создана.':'Предлагаю задачу: связаться и уточнить решение.'}`).join('\n')+'\nПодтвердите создание кнопкой в предложении.';}
    else if(/сводк|продаж|выруч|воронк/.test(q)){answer=`Аналитик:\nАктивных карточек: ${active().length}.\nОткрытая воронка: ${money(active().filter(l=>l.stage!=='Успешно').reduce((s,l)=>s+l.amount,0))}.\nУспешные сделки: ${money(active().filter(l=>l.stage==='Успешно').reduce((s,l)=>s+l.amount,0))}.\nОткрытых задач: ${openTasks().length}.\nИсточник: текущие демонстрационные карточки.`;}
    else answer='Здесь работают четыре примера поручений: «Проверь базу», «Найди дубли», «Кому нужна задача?» и «Покажи сводку». Свободный диалог с ИИ не подключён.';
    state.messages.push({role:'assistant',text:answer});save();render();const messages=document.querySelector('.chat-messages');if(messages)messages.scrollTop=messages.scrollHeight;
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.view){location.hash=b.dataset.view;return;}
    if(b.dataset.filter){filter=b.dataset.filter;render();}
    if(b.dataset.prompt)reply(b.dataset.prompt);
    if(b.dataset.merge){pendingPair=b.dataset.merge.split(',').map(Number);const [a,d]=pendingPair.map(id=>state.leads.find(l=>l.id===id));document.querySelector('#merge-description').textContent=`«${a.company}»: карточка #${d.id} будет объединена с #${a.id}. Основание — одинаковый телефон. Совпадение телефона само по себе не гарантирует, что это один заказ.`;document.querySelector('#merge-dialog').showModal();}
    if(b.dataset.task){const l=state.leads.find(l=>l.id===Number(b.dataset.task));if(!l||state.tasks.some(t=>t.leadId===l.id))return;state.tasks.push({id:Math.max(0,...state.tasks.map(t=>t.id))+1,title:`Связаться с «${l.company}» и уточнить решение`,leadId:l.id,owner:l.owner,done:false});C.record(state,`Координатор: создана задача по лиду #${l.id}. Подтверждено человеком.`);save();render();notify('Задача создана');}
    if(b.dataset.complete){C.completeTask(state,Number(b.dataset.complete));save();render();}
  });
  document.addEventListener('submit',event=>{if(event.target.id!=='chat-form')return;event.preventDefault();const input=document.querySelector('#prompt'),text=input.value.trim();if(text)reply(text);});
  document.querySelector('#merge-dialog').addEventListener('close',event=>{if(event.target.returnValue==='confirm'&&pendingPair){try{C.merge(state,...pendingPair);save();render();notify('Карточки объединены. Заметки сохранены.');}catch{notify('Карточки уже изменились. Запустите проверку снова.');}}pendingPair=null;});
  document.querySelector('#run').addEventListener('click',runAudit);
  document.querySelector('#reset').addEventListener('click',()=>document.querySelector('#reset-dialog').showModal());
  document.querySelector('#reset-dialog').addEventListener('close',event=>{if(event.target.returnValue!=='confirm')return;state=window.createDemo();save();render();notify('Исходный пример восстановлен');});
  function route(){view=['overview','agents','leads','tasks'].includes(location.hash.slice(1))?location.hash.slice(1):'overview';render();}
  window.addEventListener('hashchange',route);route();
})();
