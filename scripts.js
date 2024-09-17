(() => {
  const setTheme = condition => {
    const nextTheme = condition ? 'dark' : 'light';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);
  };
  
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme:dark)');
  darkModeMediaQuery.onchange = event => setTheme(event.matches);
  
  const lastTheme = localStorage.getItem('theme');
  if(lastTheme) {
    document.documentElement.dataset.theme = lastTheme;
  }
  else {
    setTheme(darkModeMediaQuery.matches);
  }
  
  const sanitize = value => value.replace((/&/g), '&amp;').replace((/</g), '&lt;').replace((/>/g), '&gt;').replace((/"/g), '&quot;');
  
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('unified-toggle-menu').addEventListener('click', () => {
      document.documentElement.dataset.menu = [undefined, null, ''].includes(document.documentElement.dataset.menu) ? 'show' : '';
    });
    
    document.getElementById('unified-menu-background').addEventListener('click', () => {
      document.documentElement.dataset.menu = '';
    });
    
    document.getElementById('unified-toggle-theme').addEventListener('click', () => {
      setTheme(document.documentElement.dataset.theme === 'light');
    });
    
    const pageTitlesElement = document.getElementById('unified-page-titles');
    if(pageTitlesElement) {
      fetch(new URL('/api/page-titles', location.origin).toString())
        .then(async response => {
          if(response.ok) return response.json();
          throw await response.json();
        })
        .then(json => {
          /** @type {Array<{ url: string; title: string; }>} */
          const pageTitles = json.page_titles;
          pageTitlesElement.innerHTML = pageTitles.length
            ? pageTitles.map(pageTitle => `<a href="#" class="unified-page-link" data-url="${pageTitle.url}">${sanitize(pageTitle)}</a>`).join('')
            : '<em>No Pages</em>';
        })
        .catch(error => {
          console.error('Get Page Titles : Failed', error);
          pageTitlesElement.innerHTML = '<strong>Error</strong>';
        });
    }
  });
})();
