import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/organizer/login",
    },
});

export const config = {
    matcher: [
        "/organizer/dashboard/:path*",
        "/organizer/upload/:path*",
    ],
};
