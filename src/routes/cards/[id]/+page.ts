export async function load({ fetch, params }) {
  console.log('called');
  const response = await fetch(`/api/cards/${params.id}`);
    return response.json();
  }