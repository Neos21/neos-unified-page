/**
 * Admin Delete Page
 * 
 * @param {EventContext} context Event Context
 * @return {Promise<Response>} Response
 */
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    
    const envCredential = context.env.CREDENTIAL;
    if(body.credential !== envCredential) return new Response(JSON.stringify({ error: 'Invalid Credential' }), { status: 400 });
    
    let url = body.url;
    if(url == null || String(url).trim() === '') return new Response(JSON.stringify({ error: 'Invalid Request : The URL Is Empty' }), { status: 400 });
    
    url = String(url).trim();
    const db = context.env.DB;
    const result = await db.prepare('DELETE FROM pages WHERE url = ?1').bind(url).run();
    if(result.changes === 0) return new Response(JSON.stringify({ error: 'No Deletes'       }), { status: 400 });
    if(result.changes >=  2) return new Response(JSON.stringify({ error: 'Too Many Deleted' }), { status: 400 });
    
    console.log('Page Deleted', result);
    return new Response(JSON.stringify(result));
  }
  catch(error) {
    console.error('Failed To Delete Page : Unknown Error', error);
    return new Response(JSON.stringify({ error: 'Unknown Error', error_details: error.toString() }), { status: 500 });
  }
}
