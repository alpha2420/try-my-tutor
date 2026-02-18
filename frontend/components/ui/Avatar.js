import { View, Text, Image } from 'react-native';
import { twMerge } from 'tailwind-merge';

export function Avatar({ className, children, ...props }) {
    return (
        <View
            className={twMerge(
                "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100 items-center justify-center",
                className
            )}
            {...props}
        >
            {children}
        </View>
    );
}

export function AvatarImage({ src, className, ...props }) {
    if (!src) return null;
    return (
        <Image
            source={{ uri: src }}
            className={twMerge("aspect-square h-full w-full", className)}
            resizeMode="cover"
            {...props}
        />
    );
}

export function AvatarFallback({ children, className, ...props }) {
    return (
        <View
            className={twMerge(
                "flex h-full w-full items-center justify-center rounded-full bg-slate-100",
                className
            )}
            {...props}
        >
            <Text className="text-slate-500 font-medium">{children}</Text>
        </View>
    );
}
