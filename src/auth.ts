import { SvelteKitAuth } from "@auth/sveltekit"
import GitHub from "@auth/sveltekit/providers/github"

export const { handle, signIn, signOut } = SvelteKitAuth({
  trustHost: true,
  providers: [
    GitHub({
      profile(profile) {
        console.log(profile);
        const role = profile.email === "arthur.wuhrmann@epfl.ch" ? "admin" : "user";
        return { ...profile, role: role }; 
    }})
  ],  
  callbacks: {
    jwt({ token, user }) {
      if(user) token.role = user.role
      return token
    },
    session({ session, token }) {
      session.user.role = token.role
      return session
    }
  }
})
