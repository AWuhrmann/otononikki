import { SvelteKitAuth } from "@auth/sveltekit"
import GitHub from "@auth/sveltekit/providers/github"
import type { DefaultSession } from "@auth/sveltekit";
import * as db from '$lib/server/db';

declare module "@auth/core/types" {
  interface Session {
    user: {
      role: string;
      username: string; // Add username to the session type
      id: string;
    } & DefaultSession["user"];
  }
}

export const { handle, signIn, signOut } = SvelteKitAuth({
  trustHost: true,
  providers: [
    GitHub({
      profile(profile) {
        const role = profile.email === "arthur.wuhrmann@epfl.ch" ? "admin" : "user";
        return {
          ...profile,
          id: profile.id.toString(),
          role: role, // Set default role
          username: profile.login // Get GitHub username
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Check if user exists in your database
        let dbUser = await db.getUser(profile.login);
        
        // If user doesn't exist, create them
        if (!dbUser) {
          dbUser = await db.createUser({
            username: profile.login,
            // Add any other fields you want to store
          });
        }

        user.id = dbUser.id;
        
        return true; // Allow sign in
      } catch (error) {
        console.error('Error during sign in:', error);
        return false; // Prevent sign in on error
      }
    },
    
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.id = user.id; 
      }
      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role as string;
      session.user.username = token.username as string;
      session.user.id = token.id as string; 
      return session;
    }
  }
});
