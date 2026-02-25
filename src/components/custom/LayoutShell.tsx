"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/custom/Navbar";


const HIDE_NAVBAR_ROUTES = [
    "/organizer/login",
    "/organizer/signup",
    "/organizer/upload",
    "/signin",
    "/attendee/login",
];

export default function LayoutShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const showNavbar = !HIDE_NAVBAR_ROUTES.some((route) => pathname.startsWith(route));

    return (
        <>
            {showNavbar && <Navbar />}
            <main>{children}</main>
        </>
    );
}
