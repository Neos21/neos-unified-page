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
  
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('unified-toggle-theme').addEventListener('click', () => {
      setTheme(document.documentElement.dataset.theme === 'light');
    });
    
    // Init Loading Screen
    if(['', '/'].includes(location.pathname) && new URLSearchParams(location.search).get('u') != null) {
      document.getElementById('unified-init-container'   ).style.display = 'none';
      document.getElementById('unified-loading-container').style.display = 'block';
      document.getElementById('unified-content-container').style.display = 'none';
    }
  });
})();
