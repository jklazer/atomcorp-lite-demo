window.createDemo = () => ({
  leads:[
    {id:101,name:'Анна Миронова',company:'Северный свет',phone:'+7 (900) 000-01-01',amount:180000,stage:'Переговоры',owner:'Мария',idle:2,notes:['Запрос на 12 рабочих мест']},
    {id:102,name:'А. Миронова',company:'Северный свет',phone:'8 900 000 01 01',amount:180000,stage:'Новый',owner:'Мария',idle:1,notes:['Повторная заявка с сайта']},
    {id:103,name:'Илья Ветров',company:'Линия',phone:'+7 (900) 000-01-03',amount:320000,stage:'КП отправлено',owner:'Алексей',idle:9,notes:['Ждёт расчёт расширенного тарифа']},
    {id:104,name:'Ольга Лесная',company:'Маяк',phone:'+7 (900) 000-01-04',amount:95000,stage:'Новый',owner:'Мария',idle:6,notes:['Первое обращение']},
    {id:105,name:'Павел Речной',company:'Горизонт',phone:'+7 (900) 000-01-05',amount:240000,stage:'Успешно',owner:'Алексей',idle:0,notes:['Оплата получена']},
    {id:106,name:'Елена Полевая',company:'Точка роста',phone:'+7 (900) 000-01-06',amount:125000,stage:'Переговоры',owner:'Мария',idle:3,notes:['Согласование договора']}
  ],
  tasks:[{id:1,title:'Подготовить предложение для «Северного света»',leadId:101,owner:'Мария',done:false}],
  log:[], messages:[], hasRun:false
});
