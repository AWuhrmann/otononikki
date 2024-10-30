import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./signin/$types"
 
export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth()
 
  if (!session && event.url.pathname !== "/signin") {
    const fromUrl = event.url.pathname + event.url.search
    redirect(307, `/signin?redirectTo=${encodeURIComponent(fromUrl)}`)
  }
 
  return {
    session,
  }
}