import { unified } from 'https://esm.sh/unified@11?bundle';  // https://github.com/unifiedjs/unified?tab=readme-ov-file#install
import remarkParse from 'https://esm.sh/remark-parse@11?bundle';  // https://github.com/remarkjs/remark/tree/main/packages/remark-parse#install
import remarkGfm from 'https://esm.sh/remark-gfm@4?bundle';  // https://github.com/remarkjs/remark-gfm?tab=readme-ov-file#install
import remarkToc from 'https://esm.sh/remark-toc@9?bundle';  // https://github.com/remarkjs/remark-toc?tab=readme-ov-file#install
import remarkRehype from 'https://esm.sh/remark-rehype@11?bundle';  // https://github.com/remarkjs/remark-rehype?tab=readme-ov-file#install
import rehypeSlug from 'https://esm.sh/rehype-slug@6?bundle';  // https://github.com/rehypejs/rehype-slug?tab=readme-ov-file#install
import rehypeAutolinkHeadings from 'https://esm.sh/rehype-autolink-headings@7?bundle';  // https://github.com/rehypejs/rehype-autolink-headings?tab=readme-ov-file#install
import rehypePrism from 'https://esm.sh/rehype-prism@2?bundle';  // https://github.com/Val-istar-Guo/rehype-prism
import rehypeStringify from 'https://esm.sh/rehype-stringify@10?bundle';  // https://github.com/rehypejs/rehype/tree/main/packages/rehype-stringify#install

// Prism.js
import 'https://esm.sh/prismjs@1/components/prism-bash';  // https://github.com/denoland/deno_blog/issues/15#issuecomment-1181923643
import 'https://esm.sh/prismjs@1/components/prism-json';
import 'https://esm.sh/prismjs@1/components/prism-jsx';
import 'https://esm.sh/prismjs@1/components/prism-markdown';
import 'https://esm.sh/prismjs@1/components/prism-powershell';
import 'https://esm.sh/prismjs@1/components/prism-tsx';
import 'https://esm.sh/prismjs@1/components/prism-typescript';

import prismComponents from 'https://esm.sh/prismjs@1/components/index';  // https://unpkg.com/browse/prismjs@1.29.0/components/


// Init Loading Screen
// ================================================================================

if(['', '/'].includes(location.pathname) && new URLSearchParams(location.search).get('u') != null) {
  document.getElementById('unified-init-container'   ).style.display = 'none';
  document.getElementById('unified-loading-container').style.display = 'block';
  document.getElementById('unified-content-container').style.display = 'none';
}


// Load All Languages
// ================================================================================

if(new URLSearchParams(location.search).get('a') != null) {
  await Promise.all(
    Object.keys(prismComponents.languages)
      .filter(languageName => !['meta', 'django'].includes(languageName))  // Exclude Errors
      .map(languageName => import(`https://esm.sh/prismjs@1/components/prism-${languageName}`).catch(() => null))
  ).catch(() => null);
}


// Unified Processor
// ================================================================================

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkToc, { heading: '目次', tight: true })
  .use(remarkRehype, { fragment: true, allowDangerousHtml: true })
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, {
    behavior: 'prepend',
    properties: {
      className: ['unified-header-link']
    },
    content: {
      type: 'element',
      tagName: 'span',
      properties: {
        className: ['unified-header-link-mark']
      },
      children: []
    }
  })
  .use(rehypePrism)
  .use(rehypeStringify, { allowDangerousHtml: true });


// Helpers
// ================================================================================

const sanitize = value => value.replace((/&/g), '&amp;').replace((/</g), '&lt;').replace((/>/g), '&gt;').replace((/"/g), '&quot;');

const fetchPageTitles = () => fetch(new URL('/api/page-titles', location.origin).toString())
  .then(async response => {
    if(!response.ok) throw await response.json();
    const json = await response.json();
    /** @type {Array<{ url: string; title: string; }>} */
    const pageTitles = json.page_titles;
    return pageTitles;
  });

const showContainer = containerName => {
  if(containerName === 'init') {
    document.getElementById('unified-init-container'   ).style.display = 'block';
    document.getElementById('unified-loading-container').style.display = 'none';
    document.getElementById('unified-content-container').style.display = 'none';
  }
  else if(containerName === 'loading') {
    document.getElementById('unified-init-container'   ).style.display = 'none';
    document.getElementById('unified-loading-container').style.display = 'block';
    document.getElementById('unified-content-container').style.display = 'none';
  }
  else if(containerName === 'content') {
    document.getElementById('unified-init-container'   ).style.display = 'none';
    document.getElementById('unified-loading-container').style.display = 'none';
    document.getElementById('unified-content-container').style.display = 'block';
  }
  else {
    alert(`Invalid Container Name : [${containerName}]`);
    console.error('Invalid Container Name', containerName);
  }
};

const fetchPage = async url => {
  try {
    showContainer('loading');
    document.getElementById('unified-content-container').innerHTML = '';
    
    const response = await fetch(new URL(`/api/page?url=${url}`, location.origin).toString());
    if(!response.ok) throw await response.json();
    const json = await response.json();
    console.log('Get Page', json);
    
    document.title = json.title;
    document.getElementById('unified-content-container').innerHTML = processor.processSync(json.markdown);
    
    showContainer('content');
    
    const newUrl = new URL(location.href);
    newUrl.searchParams.set('u', url);
    if(newUrl.hash === '') newUrl.hash = '';  // Remove `#`
    history.replaceState(null, '', newUrl);
    
    if(location.hash) document.querySelector(decodeURIComponent(location.hash))?.scrollIntoView();
  }
  catch(error) {
    showContainer('init');
    
    const newUrl = new URL(location.href);
    newUrl.searchParams.delete('u');
    history.replaceState(null, '', newUrl);
    
    console.log('Failed To Get Page', error);
    alert(`Failed To Get Page\n\n${error.error}`);
  }
};


// DOMContentLoaded
// ================================================================================

window.addEventListener('popstate', () => {
  const targetUrl = new URL(location.href);
  const newUrl = targetUrl.searchParams.get('u');
  if(newUrl != null) {
    fetchPage(newUrl);
  }
  else {
    showContainer('init');
  }
});

document.getElementById('unified-toggle-menu').addEventListener('click', () => {
  document.documentElement.dataset.menu = [undefined, null, ''].includes(document.documentElement.dataset.menu) ? 'show' : '';
});

document.getElementById('unified-menu-background').addEventListener('click', () => {
  document.documentElement.dataset.menu = '';
});

const pageTitlesElement = document.getElementById('unified-page-titles');
if(pageTitlesElement) {
  fetchPageTitles()
    .then(pageTitles => {
      pageTitlesElement.innerHTML = pageTitles.length
        ? pageTitles.map(pageTitle => `<a href="#" class="unified-page-link" data-url="${pageTitle.url}">${sanitize(pageTitle.title)}</a>`).join('')
        : '<em>No Pages</em>';
    })
    .catch(error => {
      console.error('Failed To Fetch Page Titles', error);
      pageTitlesElement.innerHTML = '<strong>Error</strong>';
    });
  
  pageTitlesElement.addEventListener('click', event => {
    const targetElement = event.target;
    if(targetElement?.tagName !== 'A') return;
    
    const url = targetElement.dataset.url;
    fetchPage(url);
  });
  
  const initUrl = new URL(location.href).searchParams.get('u');
  if(initUrl) fetchPage(initUrl);
}


// Admin Helpers
// ================================================================================

const saveCredential = credential => localStorage.setItem('credential', credential);

const showAdminContainer = containerName => {
  if(containerName === 'init') {
    document.getElementById('unified-admin-init-container'   ).style.display = 'block';
    document.getElementById('unified-admin-loading-container').style.display = 'none';
    document.getElementById('unified-admin-edit-container'   ).style.display = 'none';
  }
  else if(containerName === 'loading') {
    document.getElementById('unified-admin-init-container'   ).style.display = 'none';
    document.getElementById('unified-admin-loading-container').style.display = 'block';
    document.getElementById('unified-admin-edit-container'   ).style.display = 'none';
  }
  else if(containerName === 'edit') {
    document.getElementById('unified-admin-init-container'   ).style.display = 'none';
    document.getElementById('unified-admin-loading-container').style.display = 'none';
    document.getElementById('unified-admin-edit-container'   ).style.display = 'grid';
  }
  else {
    alert(`Invalid Container Name : [${containerName}]`);
    console.error('Invalid Container Name', containerName);
  }
};


// Admin DOMContentLoaded
// ================================================================================

const adminCredentialElement = document.getElementById('unified-admin-credential');
if(adminCredentialElement) {
  const credential = localStorage.getItem('credential');
  if(credential) adminCredentialElement.value = credential;
}

const adminPageTitlesElement = document.getElementById('unified-admin-page-titles');
if(adminPageTitlesElement) {
  const fetchAdminPageTitles = () => fetchPageTitles()
    .then(pageTitles => {
      adminPageTitlesElement.innerHTML = pageTitles.length
        ? pageTitles.map(pageTitle => `<a href="#" class="unified-admin-page-link" data-url="${pageTitle.url}">${sanitize(pageTitle.title)}</a>`).join('')
        : '<em>No Pages</em>';
    })
    .catch(error => {
      console.error('Failed To Fetch Admin Page Titles', error);
      adminPageTitlesElement.innerHTML = '<strong>Error</strong>';
    });
  fetchAdminPageTitles();
  
  document.getElementById('unified-admin-page-titles-reload').addEventListener('click', fetchAdminPageTitles);
  
  adminPageTitlesElement.addEventListener('click', async event => {
    try {
      const targetElement = event.target;
      if(targetElement?.tagName !== 'A') return;
      
      showAdminContainer('loading');
      const url = targetElement.dataset.url;
      const response = await fetch(new URL(`/api/page?url=${url}`, location.origin).toString());
      if(!response.ok) throw await response.json();
      const json = await response.json();
      console.log('Get Page', json);
      
      document.getElementById('unified-admin-edit-url'     ).value = json.url;
      document.getElementById('unified-admin-edit-title'   ).value = json.title;
      document.getElementById('unified-admin-edit-markdown').value = json.markdown;
      showAdminContainer('edit');
    }
    catch(error) {
      showAdminContainer('init');
      console.log('Failed To Get Page', error);
      alert(`Failed To Get Page\n\n${error.error}`);
    }
  });
}

document.getElementById('unified-admin-create')?.addEventListener('click', async () => {
  try {
    showAdminContainer('init');
    const credential = document.getElementById('unified-admin-credential').value;
    const url        = document.getElementById('unified-admin-new-url'   ).value;
    const title      = document.getElementById('unified-admin-new-title' ).value;
    
    const response = await fetch(new URL('/api/admin-create-page', location.origin).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, url, title })
    });
    if(!response.ok) throw await response.json();
    const json = await response.json();
    console.log('New Page Created', json);
    
    saveCredential(credential);
    document.getElementById('unified-admin-new-url'  ).value = '';
    document.getElementById('unified-admin-new-title').value = '';
    document.getElementById('unified-admin-page-titles-reload').click();
  }
  catch(error) {
    console.log('Failed To Create New Page', error);
    alert(`Failed To Create New Page\n\n${error.error}`);
  }
});

document.getElementById('unified-admin-edit')?.addEventListener('click', async () => {
  try {
    const credential = document.getElementById('unified-admin-credential'   ).value;
    const url        = document.getElementById('unified-admin-edit-url'     ).value;
    const title      = document.getElementById('unified-admin-edit-title'   ).value;
    const markdown   = document.getElementById('unified-admin-edit-markdown').value;
    
    const response = await fetch(new URL('/api/admin-edit-page', location.origin).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, url, title, markdown })
    });
    if(!response.ok) throw await response.json();
    const json = await response.json();
    console.log('The Page Edited', json);
    
    saveCredential(credential);
    document.getElementById('unified-admin-page-titles-reload').click();
  }
  catch(error) {
    console.log('Failed To Edit Page', error);
    alert(`Failed To Edit Page\n\n${error.error}`);
  }
});

document.getElementById('unified-admin-delete')?.addEventListener('click', async () => {
  try {
    if(!confirm('Are You Sure To Delete The Page?')) return;
    
    const credential = document.getElementById('unified-admin-credential').value;
    const url        = document.getElementById('unified-admin-edit-url'  ).value;
    
    const response = await fetch(new URL('/api/admin-delete-page', location.origin).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, url })
    });
    if(!response.ok) throw await response.json();
    const json = await response.json();
    console.log('The Page Deleted', json);
    
    saveCredential(credential);
    showAdminContainer('init');
    document.getElementById('unified-admin-page-titles-reload').click();
  }
  catch(error) {
    console.log('Failed To Delete Page', error);
    alert(`Failed To Delete Page\n\n${error.error}`);
  }
});
