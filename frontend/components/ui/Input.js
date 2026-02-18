import { TextInput, View, Text } from 'react-native';
import { twMerge } from 'tailwind-merge';

export function Input({ className, label, error, ...props }) {
    return (
        <View className="space-y-2 mb-4">
            {label && (
                <Text className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
                    {label}
                </Text>
            )}
            <TextInput
                className={twMerge(
                    "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-red-500",
                    className
                )}
                placeholderTextColor="#64748b"
                {...props}
            />
            {error && <Text className="text-xs text-red-500">{error}</Text>}
        </View>
    );
}
