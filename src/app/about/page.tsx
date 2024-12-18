import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamMember {
    name: string;
    role: string;
    description: string;
}

const teamMembers: TeamMember[] = [
    {
        name: "Alice Johnson",
        role: "CEO & Founder",
        description:
            "Alice has over 15 years of experience in tech and leads our company vision.",
    },
    {
        name: "Bob Smith",
        role: "CTO",
        description:
            "Bob oversees our technical strategy and ensures we stay at the cutting edge.",
    },
    {
        name: "Carol Williams",
        role: "Head of Design",
        description:
            "Carol brings creativity and user-centric design to all our products.",
    },
    {
        name: "David Brown",
        role: "Lead Developer",
        description:
            "David leads our development team and architects our software solutions.",
    },
    {
        name: "Eva Martinez",
        role: "Marketing Director",
        description:
            "Eva crafts our brand strategy and leads our marketing initiatives.",
    },
];

export default function About() {
    return (
        <div className="container mx-auto px-8 py-8">
            <h1 className="text-3xl font-bold text-center mb-8">
                About Our Team
            </h1>
            <p className="text-center mb-12 max-w-2xl mx-auto">
                We&apos;re a diverse group of passionate individuals working
                together to create amazing products and experiences for our
                customers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembers.map((member, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle className="text-xl">
                                {member.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                {member.role}
                            </p>
                            <p className="text-sm">{member.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
