import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const buttonVariants = {
    default: 'bg-slate-900 active:bg-slate-800',
    destructive: 'bg-red-500 active:bg-red-600',
    outline: 'border border-slate-200 bg-white active:bg-slate-100',
    secondary: 'bg-slate-100 text-slate-900 active:bg-slate-200',
    ghost: 'active:bg-slate-100',
    link: 'text-slate-900 underline-offset-4 hover:underline',
};

const textVariants = {
    default: 'text-white',
    destructive: 'text-white',
    outline: 'text-slate-900',
    secondary: 'text-slate-900',
    ghost: 'text-slate-900',
    link: 'text-slate-900',
};

export function Button({
    className,
    variant = 'default',
    size = 'default',
    children,
    loading = false,
    textClassName,
    ...props
}) {
    const baseStyles = 'flex-row items-center justify-center rounded-md disabled:opacity-50';
    const sizeStyles = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
    };

    return (
        <TouchableOpacity
            className={twMerge(
                baseStyles,
                buttonVariants[variant],
                sizeStyles[size],
                className
            )}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading && <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? 'black' : 'white'} className="mr-2" />}
            {typeof children === 'string' ? (
                <Text className={twMerge('text-sm font-medium web:transition-colors', textVariants[variant], textClassName)}>
                    {children}
                </Text>
            ) : (
                children
            )}
        </TouchableOpacity>
    );
}
