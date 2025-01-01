import { SvelteKitAuth } from "@auth/sveltekit"
import GitHub from "@auth/sveltekit/providers/github"
import type { DefaultSession } from "@auth/sveltekit";

declare module "@auth/core/types" {
  interface Session {
    user: {
      role: string; // or string[] if supporting multiple roles
    } & DefaultSession["user"];
  }
}

export const { handle, signIn, signOut } = SvelteKitAuth({
  trustHost: true,
  providers: [
    GitHub({
      profile(profile) {
        console.log(profile);
        const role = profile.email === "arthur.wuhrmann@epfl.ch" ? "admin" : "user";
        return { ...profile, id: profile.id.toString(), role: role }; 
    }})
  ],  
  callbacks: {
    jwt({ token, user }) {
      if(user && 'role' in user) token.role = user.role
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as string
      return session
    }
  }
})
