
export async function load({ fetch, params }) {
  const response = await fetch(`/api/cards/${params.id}`);
  const data = await response.json();
  return data;
}