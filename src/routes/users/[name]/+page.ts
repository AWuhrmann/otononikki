
export async function load({ fetch, params }) {
    return {
      username: params.name
    };
}