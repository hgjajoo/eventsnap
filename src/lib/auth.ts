import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { connect } from "@/db/dbConfig";
import User from "@/models/user.model";

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
            // OAuth flow — find or create user
            await connect();

            const existingUser = await User.findOne({
                email: user.email?.toLowerCase(),
            });

            if (existingUser) {
                // Update image if changed
                if (user.image && existingUser.image !== user.image) {
                    existingUser.image = user.image;
                    await existingUser.save();
                }
                return true;
            }

            // Create new user from OAuth
            const username =
                (user.email?.split("@")[0] ?? "") + "_" + Date.now().toString(36);
            await User.create({
                fullName: user.name || "User",
                username,
                email: user.email?.toLowerCase(),
                provider: account?.provider,
                image: user.image || "",
                isVerified: true,
                events: [],
            });

            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                await connect();
                const dbUser = await User.findOne({
                    email: user.email?.toLowerCase(),
                });
                if (dbUser) {
                    token.userId = dbUser._id.toString();
                    token.username = dbUser.username;
                    token.isAdmin = dbUser.isAdmin;
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
