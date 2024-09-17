const isNull = value => value == null || String(value).trim() === '';

/**
 * Admin Edit Page
 * 
 * @param {EventContext} context Event Context
 * @return {Promise<Response>} Response
 */
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    
    const envCredential = context.env.CREDENTIAL;
    if(body.credential !== envCredential) return new Response(JSON.stringify({ error: 'Invalid Credential' }), { status: 400 });
    
    let url      = body.url;
    let title    = body.title;
    let markdown = body.markdown;
    if(isNull(url)     ) return new Response(JSON.stringify({ error: 'Invalid Request : The URL Is Empty'      }), { status: 400 });
    if(isNull(title)   ) return new Response(JSON.stringify({ error: 'Invalid Request : The Title Is Empty'    }), { status: 400 });
    if(isNull(markdown)) return new Response(JSON.stringify({ error: 'Invalid Request : The Markdown Is Empty' }), { status: 400 });
    
    url      = String(url     ).trim();
    title    = String(title   ).trim();
    markdown = String(markdown).trim();
    const db = context.env.DB;
    const result = await db.prepare('UPDATE pages SET title = ?1, markdown = ?2 WHERE url = ?3').bind(title, markdown, url).run();
    if(result.changes === 0) return new Response(JSON.stringify({ error: 'No Updates'       }), { status: 400 });
    if(result.changes >=  2) return new Response(JSON.stringify({ error: 'Too Many Updated' }), { status: 400 });
    
    console.log('Page Edited', result);
    return new Response(JSON.stringify(result));
  }
  catch(error) {
    console.error('Failed To Edit Page : Unknown Error', error);
    return new Response(JSON.stringify({ error: 'Unknown Error', error_details: error.toString() }), { status: 500 });
  }
}
