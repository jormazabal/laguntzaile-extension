document.addEventListener('DOMContentLoaded', function() {
  const titles = { es: 'Política de Privacidad', en: 'Privacy Policy', eu: 'Pribatutasun Politika' };
  const updated = { es: 'Última actualización: Diciembre 2025', en: 'Last updated: December 2025', eu: 'Azken eguneraketa: 2025eko Abendua' };
  
  const langSelect = document.getElementById('lang-select');
  const titleEl = document.getElementById('title');
  const updatedEl = document.getElementById('updated');
  const contents = document.querySelectorAll('.lang-content');
  
  function switchLang(lang) {
    // Update title and date
    titleEl.textContent = titles[lang] || titles.es;
    updatedEl.textContent = updated[lang] || updated.es;
    document.documentElement.lang = lang;
    
    // Show/hide content sections
    contents.forEach(function(c) {
      if (c.getAttribute('data-lang') === lang) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
  }
  
  // Check URL param or localStorage
  const params = new URLSearchParams(window.location.search);
  let savedLang = params.get('lang') || 'es';
  try {
    savedLang = localStorage.getItem('laguntzaile_lang') || savedLang;
  } catch(e) {}
  
  langSelect.value = savedLang;
  switchLang(savedLang);
  
  langSelect.addEventListener('change', function(e) {
    const newLang = e.target.value;
    switchLang(newLang);
    try {
      localStorage.setItem('laguntzaile_lang', newLang);
    } catch(e) {}
  });
});
