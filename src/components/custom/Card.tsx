import React from "react";

interface DarkThemeCardProps {
    title: string;
    description: string;
    image?: string;
}

const DarkThemeCard: React.FC<DarkThemeCardProps> = ({
    title,
    description,
}) => {
    return (
        <div className="bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 max-w-sm p-6 rounded-lg shadow-lg">
            <header className="mb-4 text-center">
                <h2 className="text-3xl font-semibold mb-2">{title}</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    {description}
                </p>
            </header>
        </div>
    );
};

export default DarkThemeCard;
