(function(){
"use strict";
var sheets=window.BT_SHEETS||[];
var report=window.BT_REPORT||{sections:[]};
var tabButtons=[],currentSheet=0,sortCol=-1,sortDir=1;
function esc(s){return String(s===undefined||s===null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function safeUrl(s){return /^https?:\/\/[^\s]+$/i.test(String(s||"").trim())?String(s).trim():null}
function linkify(s,head){var str=String(s||"").trim();var url=safeUrl(str);if(url){return '<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Открыть источник ↗</a>'}return esc(str||"—")}
function displayValue(v,head){var text=String(v===null||v===undefined?"":v);var h=String(head||"").toLowerCase();if(!text.trim())return '<span style="color:#a1afa9">—</span>';if(h.indexOf("тональность")!==-1)return '<span class="tag '+(text==="отрицательный"?"negative":"")+'">'+esc(text)+'</span>';return linkify(text,head)}
function reportInit(){
 var nav=document.getElementById("chapterNav"),article=document.getElementById("reportContent");if(!report.sections.length){nav.textContent="Исследование недоступно";return}
 nav.innerHTML=report.sections.map(function(s,i){return '<button type="button" data-chapter="'+i+'" '+(i===0?'class="active"':'')+'><span>'+String(s.number).padStart(2,"0")+'.</span>'+esc(s.title)+'</button>'}).join("");
 function show(index){index=Math.max(0,Math.min(index,report.sections.length-1));var s=report.sections[index];Array.prototype.forEach.call(nav.querySelectorAll("button"),function(b,i){b.classList.toggle("active",i===index)});
 var blocks=s.body.split(/\n\s*\n/).map(function(b){return b.trim()}).filter(Boolean);
 var text=blocks.map(function(b){var compact=b.replace(/\n\s*/g," ").replace(/\s{2,}/g," ").trim();if(/^[0-9]{1,2}\.[0-9]{1,2}\.\s/.test(compact))return '<p class="report-minihead">'+esc(compact)+'</p>';if((b.match(/ {5,}/g)||[]).length>=3)return '<div class="report-raw-table">'+esc(b)+'</div>';var processed=esc(compact).replace(/(https?:\/\/[^\s<]+)/g,function(url){return '<a href="'+url+'" target="_blank" rel="noopener noreferrer" style="color:#078e89;overflow-wrap:anywhere">'+url+'</a>'});return '<p>'+processed+'</p>'}).join("");
 article.innerHTML='<div class="report-meta"><span>Раздел '+String(s.number).padStart(2,"0")+' / 14</span><span>Срез: 20.11.2026</span><span>BEST THERAPY</span></div><h3 class="report-title">'+esc(s.title)+'</h3><div class="report-text">'+text+'</div><div class="report-note">Материал воспроизводит содержание исследовательского отчёта. Расшифровки источников, сравнения и данные отзывов доступны в разделе «База данных». Обнаруженные публикации и оценки имеют указанные в исследовании ограничения проверки.</div>';
 }
 nav.addEventListener("click",function(e){var b=e.target.closest("button[data-chapter]");if(b)show(Number(b.dataset.chapter))});
 show(0);
}
function explorerInit(){var tabs=document.getElementById("sheetTabs");if(!sheets.length){tabs.textContent="Данные не найдены";return}
 tabs.innerHTML=sheets.map(function(s,i){return '<button type="button" data-sheet="'+i+'" '+(i===0?'class="active"':'')+'>'+esc(s.name.replace("_"," "))+'</button>'}).join("");
 tabs.addEventListener("click",function(e){var b=e.target.closest("button[data-sheet]");if(b){currentSheet=Number(b.dataset.sheet);sortCol=-1;document.getElementById("tableSearch").value="";document.getElementById("sentimentFilter").value="";document.getElementById("platformFilter").value="";renderTable()}});
 ["tableSearch","sentimentFilter","platformFilter"].forEach(function(id){document.getElementById(id).addEventListener(id==="tableSearch"?"input":"change",renderTable)});
 document.querySelector("#dataTable thead").addEventListener("click",function(e){var b=e.target.closest("button[data-col]");if(b){var i=Number(b.dataset.col);if(sortCol===i)sortDir=-sortDir;else{sortCol=i;sortDir=1}renderTable()}});
 renderTable();
}
function renderTable(){var s=sheets[currentSheet];if(!s)return;var review=s.name==="Отзывы";document.getElementById("sentimentFilter").hidden=!review;document.getElementById("platformFilter").hidden=!review;
 Array.prototype.forEach.call(document.querySelectorAll("#sheetTabs button"),function(b,i){b.classList.toggle("active",i===currentSheet)});
 var q=document.getElementById("tableSearch").value.toLocaleLowerCase("ru").trim();var sent=document.getElementById("sentimentFilter").value,platform=document.getElementById("platformFilter").value;
 var ixSent=s.headers.indexOf("Тональность"),ixPlatform=s.headers.indexOf("Площадка");
 var rows=s.rows.filter(function(r){return (!q||r.join(" ").toLocaleLowerCase("ru").includes(q))&&(!sent||ixSent<0||r[ixSent]===sent)&&(!platform||ixPlatform<0||r[ixPlatform]===platform)});
 if(sortCol>=0)rows.sort(function(a,b){return String(a[sortCol]||"").localeCompare(String(b[sortCol]||""),"ru",{numeric:true})*sortDir});
 document.getElementById("rowCount").textContent=rows.length+" из "+s.rows.length+" записей";
 var desc={"Панель":"Сводные показатели бренда и геосервисов.","Геосервисы":"Рейтинги, оценки, текстовые отзывы и ограничения сопоставления.","Отзывы":"55 изученных записей; авторы, краткий пересказ, тематические метки и ссылки на площадки.","Темы":"Ручное многометочное кодирование 54 уникальных историй, без экстраполяции на всех клиентов.","Источники":"Реестр 34 источников с уровнем независимости, статусом проверки и прямыми ссылками.","СМИ_упоминания":"Внешние следы и упоминания; коммерческие каталоги не приравниваются к независимым СМИ.","Соцсети":"Проверка публичных аккаунтов и доступности данных, включая Instagram.","Конкуренты":"Три сопоставимых игрока Барнаула — с ограничениями сравнения.","Рекомендации":"Приоритеты и основания для развития бренда и репутации.","Методика":"Правила проверки фактов и ограничения исследования."};
 document.getElementById("sheetExplain").textContent=desc[s.name]||"Проверенные материалы исследовательской базы.";
 document.querySelector("#dataTable thead").innerHTML="<tr>"+s.headers.map(function(h,i){return '<th><button data-col="'+i+'" title="Сортировать">'+esc(h)+(sortCol===i?(sortDir>0?" ↑":" ↓"):"")+'</button></th>'}).join("")+"</tr>";
 document.querySelector("#dataTable tbody").innerHTML=rows.map(function(row){return "<tr>"+s.headers.map(function(head,i){return '<td data-label="'+esc(head)+'">'+displayValue(row[i],head)+"</td>"}).join("")+"</tr>"}).join("");
 document.getElementById("tableEmpty").hidden=rows.length>0;
}
if(document.getElementById('chapterNav'))reportInit();
if(document.getElementById('sheetTabs'))explorerInit();
})();

