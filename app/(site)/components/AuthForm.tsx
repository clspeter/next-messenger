'use client'
import React, { useCallback } from 'react'
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"
import Input from '@/app/components/inputs/Input';
import Button from "@/app/components/inputs/Button";
import AuthSocialButton from "./AuthSocialButton";
import { BsGithub, BsGoogle } from 'react-icons/bs'


type Props = {}
type Varient = 'LOGIN' | 'REGISTER'

const AuthForm = (props: Props) => {
    const [variant, setVariant] = React.useState<Varient>('LOGIN')
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    const toggleVariant = useCallback(() => {
        if (variant === 'LOGIN') setVariant('REGISTER')
        else setVariant('LOGIN')
    }, [variant])

    const { register,
        handleSubmit,
        formState: {
            errors
        }
    } = useForm<FieldValues>({
        defaultValues: {
            email: '',
            password: '',
            name: ''
        }
    })

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsLoading(true)
        if (variant === 'REGISTER') {
            //Axios Register
        } else if (variant === 'LOGIN') {
            //NextAuth SignIn
        }
    }

    const socialAction = (action: string) => {
        setIsLoading(true)

        //NextAuto  Social Sign In
    }

    const toogleVariant = () => {
        if (variant === 'LOGIN') setVariant('REGISTER')
        else if (variant === 'REGISTER') setVariant('LOGIN')
    }


    return (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
                <form action="" className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {variant === 'REGISTER' && (
                        <Input id="name" label="Name" register={register} errors={errors} disabled={isLoading} />
                    )}
                    <Input id="email" label="Email" register={register} errors={errors} disabled={isLoading} />
                    <Input id="password" label="Password" type="password" register={register} errors={errors} disabled={isLoading} />
                    <Button disabled={isLoading} fullWidth type="submit">Test</Button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm text-gray-500">
                            <span className="bg-white px-2 text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                        <AuthSocialButton icon={BsGithub} onClick={() => socialAction('github')} />
                        <AuthSocialButton icon={BsGoogle} onClick={() => socialAction('google')} />
                    </div>
                </div>
                <div className="mt-6 flex justify-center gap-2 px-2 text-sm text-gray-500">
                    <div>
                        {variant === 'LOGIN' ? "New to Messener?" : "Already have an account?"}
                    </div>
                    <div onClick={toogleVariant} className="cursor-pointer underline">
                        {variant === 'LOGIN' ? "Create an account" : "Login"}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthForm