'use client'

import clsx from 'clsx';
import {
    FieldErrors,
    FieldValues,
    UseFormRegister,
} from 'react-hook-form';

interface InputProps {
    label: string;
    id: string;
    type?: string;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors<FieldValues>;
    disabled?: boolean;
    required?: boolean;
}


const Input: React.FC<InputProps> = ({ label, id, type, required, register, errors, disabled }) => {
    return (<div>
        I am a input
    </div>);
}

export default Input;