
export async function load({ fetch, params }) {
    const response = await fetch(`/api/users/${params.name}`);
    const data = await response.json();
    return data;
  }