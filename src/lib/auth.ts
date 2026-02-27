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
            try {
                const email = user.email?.toLowerCase();
                if (!email || !account) {
                    console.error("[AUTH] signIn denied: missing email or account", { email, account });
                    return false;
                }


                // Check if user already exists
                const { data: existingUser, error: selectError } = await supabase
                    .from("users")
                    .select("id, image")
                    .eq("email", email)
                    .single();

                if (selectError && selectError.code !== "PGRST116") {
                    console.error("[AUTH] Supabase select error:", selectError);
                }

                if (existingUser) {
                    if (user.image && existingUser.image !== user.image) {
                        await supabase
                            .from("users")
                            .update({ image: user.image })
                            .eq("id", existingUser.id);
                    }
                    return true;
                }

                const username =
                    (email.split("@")[0] ?? "") + "_" + Date.now().toString(36);


                const { error } = await supabase.from("users").insert({
                    full_name: user.name || "User",
                    username,
                    email,
                    provider: account.provider,
                    image: user.image || "",
                });

                if (error) {
                    console.error("[AUTH] Supabase insert error:", error);
                }

                return !error;
            } catch (err) {
                console.error("[AUTH] SignIn callback error:", err);
                return false;
            }
        },

        async jwt({ token, user, trigger }) {
            try {
                if (user || trigger === "update") {
                    const { data: dbUser, error } = await supabase
                        .from("users")
                        .select("id, username, role, has_encoding")
                        .eq("email", (user?.email || token.email as string)?.toLowerCase())
                        .single();

                    if (dbUser && !error) {
                        token.userId = dbUser.id;
                        token.username = dbUser.username;
                        token.role = dbUser.role ?? "attendee";
                        token.hasEncoding = dbUser.has_encoding ?? false;
                    }
                }
            } catch (err) {
                console.error("[AUTH] JWT callback error:", err);
            }
            return token;
        },

        async session({ session, token }) {
            try {
                if (session.user) {
                    (session.user as any).id = token.userId;
                    (session.user as any).username = token.username;
                    (session.user as any).role = token.role ?? "attendee";
                    (session.user as any).hasEncoding = token.hasEncoding ?? false;
                }
            } catch (err) {
                console.error("[AUTH] Session callback error:", err);
            }
            return session;
        },
    },

    pages: {
        signIn: "/signin",
        error: "/signin",
    },

    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },

    secret: process.env.NEXTAUTH_SECRET,
};
