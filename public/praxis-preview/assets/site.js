const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
function closeMenu() {
  navigation?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation?.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
navigation?.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});


const notice=document.getElementById('praxis-hinweis');
if(notice?.dataset.enabled==='true' && typeof notice.showModal==='function'){
  notice.showModal(); document.getElementById('hinweis-schliessen').addEventListener('click',()=>notice.close());
}
const form=document.getElementById('anfrage-form');
if(form){
 const concern=document.getElementById('anliegen'), specialty=document.getElementById('fach'), field=document.getElementById('fachwahl'), other=document.getElementById('sonstige-feld'), label=document.getElementById('anfrage-label');
 const button=document.getElementById('anfrage-send'), status=document.getElementById('anfrage-status');
 const api='/api/praxis-contact';
 const update=()=>{field.hidden=concern.value!=='Überweisung';other.hidden=field.hidden||specialty.value!=='Sonstige';label.textContent=concern.value==='Rezept'?'Rezeptanfrage':concern.value==='Überweisung'?'Organisatorischer Überweisungsgrund':concern.value==='Terminvereinbarung'?'Terminwunsch':'Ihre Nachricht';};
 concern.addEventListener('change',update);specialty.addEventListener('change',update);update();
 let available=false;
 fetch(api,{cache:'no-store'}).then(async response=>{const data=await response.json();available=response.ok&&data.available===true;button.disabled=!available;status.textContent=available?'Ein Termin ist erst nach Bestätigung vereinbart.':'Online-Versand derzeit nicht verfügbar. Bitte kontaktieren Sie uns telefonisch.';}).catch(()=>{status.textContent='Online-Versand derzeit nicht verfügbar. Bitte kontaktieren Sie uns telefonisch.';});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(!available||!form.reportValidity())return;
  button.disabled=true;status.textContent='Nachricht wird gesendet …';
  try{
   const response=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:document.getElementById('anfrage-name').value,email:document.getElementById('anfrage-email').value,concern:concern.value,specialty:field.hidden?'':specialty.value,other:other.hidden?'':document.getElementById('sonstige').value,message:document.getElementById('anfrage-text').value,consent:document.getElementById('anfrage-consent').checked,website:document.getElementById('anfrage-website').value})});
   const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.message||'Der Versand war nicht möglich.');
   form.reset();update();status.textContent='Ihre Nachricht wurde zur Übermittlung angenommen. Vielen Dank! Ein Termin ist erst nach Bestätigung vereinbart.';
  }catch(error){status.textContent=error.message==='Failed to fetch'?'Die Verbindung ist fehlgeschlagen. Bitte versuchen Sie es erneut oder rufen Sie uns an.':error.message||'Der Versand war nicht möglich.';}
  finally{button.disabled=!available;}
 });
}
