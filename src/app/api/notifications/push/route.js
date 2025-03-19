export async function POST(request) {
  try {
    const { title, message, icon, link } = await request.json();
    
    // Aici ar veni integrarea cu Web Push API
    // Utilizând librării precum web-push
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 