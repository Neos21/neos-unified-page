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
import 'https://esm.sh/prismjs@1/components/prism-markdown';
import 'https://esm.sh/prismjs@1/components/prism-powershell';

import prismComponents from 'https://esm.sh/prismjs@1/components/index';  // https://unpkg.com/browse/prismjs@1.29.0/components/
if(new URLSearchParams(location.search).get('prism-all') != null) {
  await Promise.all(
    Object.keys(prismComponents.languages)
      .filter(languageName => !['meta', 'django'].includes(languageName))  // Exclude Errors
      .map(languageName => import(`https://esm.sh/prismjs@1/components/prism-${languageName}`).catch(() => null))
  ).catch(() => null);
}

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

// Export To Global
window.processor = processor;
