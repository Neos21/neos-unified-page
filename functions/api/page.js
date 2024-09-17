/**
 * Get Page
 * 
 * @param {EventContext} context Event Context
 * @return {Promise<Response>} Response
 */
export async function onRequestGet(context) {
  try {
    let url = new URL(context.request.url).searchParams?.get('url');
    if(url == null || String(url).trim() === '') return new Response(JSON.stringify({ error: 'Invalid Request : The URL Is Empty' }), { status: 400 });
    
    url = String(url).trim();
    const db = context.env.DB;
    const result = await db.prepare('SELECT url, title, markdown FROM pages WHERE url = ?1').bind(url).first();
    if(result == null) return new Response(JSON.stringify({ error: 'The Page Does Not Exist' }), { status: 400 });
    
    console.log('Get Page', result);
    return new Response(JSON.stringify(result));
  }
  catch(error) {
    console.error('Failed To Get Page', error);
    return new Response(JSON.stringify({ error: error.toString() }), { status: 500 });
  }
}
