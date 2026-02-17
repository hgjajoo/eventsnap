"use client";

import React from "react";
import { Github, Linkedin } from "lucide-react";

const team = [
    {
        name: "Team Member 1",
        role: "Full Stack Developer",
        bio: "Passionate about building scalable web applications.",
        github: "#",
        linkedin: "#",
    },
    {
        name: "Team Member 2",
        role: "ML Engineer",
        bio: "Specializing in computer vision and face recognition.",
        github: "#",
        linkedin: "#",
    },
    {
        name: "Team Member 3",
        role: "Backend Developer",
        bio: "Expert in database design and API development.",
        github: "#",
        linkedin: "#",
    },
    {
        name: "Team Member 4",
        role: "UI/UX Designer",
        bio: "Creating beautiful and intuitive user experiences.",
        github: "#",
        linkedin: "#",
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen pt-28 pb-12 px-6">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/15 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        About <span className="gradient-text">Eventsnap</span>
                    </h1>
                    <p className="text-white/50 text-lg max-w-2xl mx-auto">
                        We&apos;re building the future of event photo sharing — using AI face
                        recognition to connect people with their memories instantly.
                    </p>
                </div>

                {/* Mission */}
                <div className="p-8 rounded-2xl glass mb-12">
                    <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
                    <p className="text-white/60 leading-relaxed">
                        Eventsnap was born from a simple frustration: sorting through
                        thousands of event photos to find the ones you&apos;re in. Our platform
                        uses cutting-edge face recognition technology to instantly match
                        attendees with their photos, turning hours of manual searching into
                        seconds of effortless discovery.
                    </p>
                </div>

                {/* Team */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-center mb-8">Meet the Team</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {team.map((member) => (
                            <div
                                key={member.name}
                                className="group p-6 rounded-2xl glass hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-2xl font-bold text-white">
                                    {member.name.charAt(0)}
                                </div>
                                <h3 className="font-semibold text-lg">{member.name}</h3>
                                <p className="text-sm text-violet-400 mb-2">{member.role}</p>
                                <p className="text-sm text-white/40 mb-4">{member.bio}</p>
                                <div className="flex items-center justify-center gap-3">
                                    <a
                                        href={member.github}
                                        className="text-white/30 hover:text-white transition-colors"
                                    >
                                        <Github size={18} />
                                    </a>
                                    <a
                                        href={member.linkedin}
                                        className="text-white/30 hover:text-white transition-colors"
                                    >
                                        <Linkedin size={18} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="p-8 rounded-2xl glass text-center">
                    <h2 className="text-2xl font-bold mb-4">Built With</h2>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {[
                            "Next.js",
                            "TypeScript",
                            "MongoDB",
                            "NextAuth.js",
                            "Python",
                            "OpenCV",
                            "Tailwind CSS",
                        ].map((tech) => (
                            <span
                                key={tech}
                                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
