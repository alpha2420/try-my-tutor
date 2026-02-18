import { View, Text } from 'react-native';
import { twMerge } from 'tailwind-merge';

const badgeVariants = {
    default: 'bg-slate-900',
    secondary: 'bg-slate-100',
    destructive: 'bg-red-500',
    outline: 'text-slate-950 border border-slate-200',
};

const textVariants = {
    default: 'text-white',
    secondary: 'text-slate-900',
    destructive: 'text-white',
    outline: 'text-slate-900',
};

export function Badge({ className, variant = 'default', children, ...props }) {
    return (
        <View
            className={twMerge(
                "inline-flex items-center rounded-full px-2.5 py-0.5 border border-transparent self-start",
                badgeVariants[variant],
                className
            )}
            {...props}
        >
            <Text className={twMerge("text-xs font-semibold pb-[1px]", textVariants[variant])}>
                {children}
            </Text>
        </View>
    );
}
