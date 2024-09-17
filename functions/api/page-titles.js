/**
 * Get Page Titles
 * 
 * @param {EventContext} context Event Context
 * @return {Promise<Response>} Response
 */
export async function onRequestGet(context) {
  try {
    const db = context.env.DB;
    const result = await db.prepare('SELECT url, title FROM pages ORDER BY title DESC').all();
    const pageTitles = { page_titles: result.results };
    
    console.log('Get Page Titles', pageTitles);
    return new Response(JSON.stringify(pageTitles));
  }
  catch(error) {
    console.error('Failed To Get Page Titles', error);
    return new Response(JSON.stringify({ error: error.toString() }), { status: 500 });
  }
}
