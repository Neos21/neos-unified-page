const isNull = value => value == null || String(value).trim() === '';

/**
 * Admin Create Page
 * 
 * @param {EventContext} context Event Context
 * @return {Promise<Response>} Response
 */
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    
    const envCredential = context.env.CREDENTIAL;
    if(body.credential !== envCredential) return new Response(JSON.stringify({ error: 'Invalid Credential' }), { status: 400 });
    
    let url   = body.url;
    let title = body.title;
    if(isNull(url)  ) return new Response(JSON.stringify({ error: 'Invalid Request : The URL Is Empty'   }), { status: 400 });
    if(isNull(title)) return new Response(JSON.stringify({ error: 'Invalid Request : The Title Is Empty' }), { status: 400 });
    
    url   = String(url  ).trim();
    title = String(title).trim();
    if(!(/^[a-z-]+$/u).test(url)) return new Response(JSON.stringify({ error: 'Invalid Request : The URL Is Invalid Pattern' }), { status: 400 });
    
    const db = context.env.DB;
    const result = await db.prepare('INSERT INTO pages (url, title, markdown) values (?1, ?2, "")').bind(url, title).run();
    
    console.log('New Page Creatd', result);
    return new Response(JSON.stringify(result));
  }
  catch(error) {
    if(error.toString().includes('SQLITE_CONSTRAINT')) {
      console.error('The URL Is Already Exist', error);
      return new Response(JSON.stringify({ error: 'The URL Is Already Exist' }), { status: 400 });
    }
    
    console.error('Failed To Create New Page : Unknown Error', error);
    return new Response(JSON.stringify({ error: 'Unknown Error', error_details: error.toString() }), { status: 500 });
  }
}
