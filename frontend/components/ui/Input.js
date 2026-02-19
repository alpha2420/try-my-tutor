import { TextInput, View, Text } from 'react-native';
import { twMerge } from 'tailwind-merge';

export function Input({ className, label, error, ...props }) {
    const isMultiline = props.multiline;
    return (
        <View className="space-y-2 mb-4">
            {label && (
                <Text className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
                    {label}
                </Text>
            )}
            <TextInput
                style={{ textAlignVertical: isMultiline ? 'top' : 'center', includeFontPadding: false }}
                className={twMerge(
                    "flex w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all",
                    isMultiline ? "h-auto py-3 min-h-[100px]" : "h-12 py-0",
                    error && "border-red-500 focus:border-red-500 focus:ring-red-200",
                    className
                )}
                placeholderTextColor="#94a3b8"
                {...props}
            />
            {error && <Text className="text-xs text-red-500 ml-1">{error}</Text>}
        </View>
    );
}
