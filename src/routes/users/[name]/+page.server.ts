import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
    const session = await locals.getSession();
    if (!session?.user) throw redirect(307, '/signin');
    console.log(session);
    return {
      username: session.user.username,
      role: session.user.role,
      id: session.user.id
    };
  }