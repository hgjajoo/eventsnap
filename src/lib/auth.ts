import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID ?? "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
        }),
    ],

    callbacks: {
        async signIn({ user, account }) {
            const email = user.email?.toLowerCase();
            if (!email || !account) return false;

            // Check if user already exists
            const { data: existingUser } = await supabase
                .from("users")
                .select("id, image")
                .eq("email", email)
                .single();

            if (existingUser) {
                // Update avatar if changed
                if (user.image && existingUser.image !== user.image) {
                    await supabase
                        .from("users")
                        .update({ image: user.image })
                        .eq("id", existingUser.id);
                }
                return true;
            }

            // Create new user from OAuth
            const username =
                (email.split("@")[0] ?? "") + "_" + Date.now().toString(36);

            const { error } = await supabase.from("users").insert({
                full_name: user.name || "User",
                username,
                email,
                provider: account.provider,
                image: user.image || "",
            });

            return !error;
        },

        async jwt({ token, user }) {
            if (user) {
                const { data: dbUser } = await supabase
                    .from("users")
                    .select("id, username, is_admin")
                    .eq("email", user.email?.toLowerCase())
                    .single();

                if (dbUser) {
                    token.userId = dbUser.id;
                    token.username = dbUser.username;
                    token.isAdmin = dbUser.is_admin;
                }
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.userId;
                (session.user as any).username = token.username;
                (session.user as any).isAdmin = token.isAdmin;
            }
            return session;
        },
    },

    pages: {
        signIn: "/organizer/login",
        error: "/organizer/login",
    },

    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },

    secret: process.env.NEXTAUTH_SECRET,
};
