import { View, Text } from 'react-native';
import { twMerge } from 'tailwind-merge';

export function Card({ className, ...props }) {
    return (
        <View
            className={twMerge(
                "rounded-lg border border-slate-200 bg-white shadow-sm",
                className
            )}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }) {
    return (
        <View className={twMerge("flex flex-col space-y-1.5 p-6", className)} {...props} />
    );
}

export function CardTitle({ className, ...props }) {
    return (
        <Text
            className={twMerge(
                "text-2xl font-semibold leading-none tracking-tight text-slate-900",
                className
            )}
            {...props}
        />
    );
}

export function CardDescription({ className, ...props }) {
    return (
        <Text
            className={twMerge("text-sm text-slate-500", className)}
            {...props}
        />
    );
}

export function CardContent({ className, ...props }) {
    return <View className={twMerge("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
    return (
        <View className={twMerge("flex flex-row items-center p-6 pt-0", className)} {...props} />
    );
}
