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
const concern=document.getElementById('anliegen');
if(concern){
 const specialty=document.getElementById('fach'), field=document.getElementById('fachwahl'), other=document.getElementById('sonstige-feld'), label=document.getElementById('anfrage-label');
 const update=()=>{field.hidden=concern.value!=='Überweisung';other.hidden=specialty.value!=='Sonstige';label.textContent=concern.value==='Rezept'?'Organisatorische Rezeptanfrage (keine Medikamentennamen oder Gesundheitsdaten)':concern.value==='Überweisung'?'Organisatorischer Überweisungsgrund (keine Diagnosen oder Gesundheitsdaten)':'Organisatorischer Terminwunsch (keine Gesundheitsdaten)';};
 concern.addEventListener('change',update); specialty.addEventListener('change',update);update();
 document.getElementById('anfrage-form').addEventListener('submit',e=>e.preventDefault());
 document.getElementById('anfrage-mail').addEventListener('click',()=>{if(!confirm('Bitte prüfen Sie, dass Ihre Nachricht keine Gesundheitsdaten enthält. E-Mail ist kein sicherer Übertragungsweg für medizinische Informationen.'))return;const body=concern.value==='Überweisung'?'Fachrichtung: '+specialty.value+(specialty.value==='Sonstige'?' '+document.getElementById('sonstige').value:'')+'\n':'';location.href='mailto:bremen.ost.hausaerzte@gmail.com?subject='+encodeURIComponent(concern.value)+'&body='+encodeURIComponent(body+document.getElementById('anfrage-text').value);});
}
