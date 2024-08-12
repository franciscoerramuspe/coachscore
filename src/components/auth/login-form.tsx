'use client'

import * as z from 'zod'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema } from '../../../schemas/index'
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'

import { CardWrapper } from "./card-wrapper"
import { Button } from '../ui/button'
import { FormError } from '../form-error'
import { FormSuccess } from '../form-success'
import { login } from '../../../actions/login'

export const LoginForm = () => {
    const [error, setError] = useState<string | undefined>('');
    const [success, setSucess] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError('');
        setSucess('');

        startTransition(() => {
            login(values)
                .then((data) => {
                    setError(data.error);
                    setSucess(data.success);
                })
        });     
    }

    return (
        <CardWrapper 
            headerLabel="welcome back"
            backButtonLabel="Don't have an account?"
            backButtonHref="/auth/register"
            showSocial
        > 
            <Form {...form}>
                <form 
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-6'
                >
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder='Your email address'
                                            type='email'
                                        />
                                    </FormControl>
                                    <FormMessage 

                                    />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder='Your password'
                                            type='password'
                                        />
                                    </FormControl>
                                    <FormMessage 
                                        
                                    />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error}/>
                    <FormSuccess message={success} />
                    <Button
                        disabled={isPending}
                        type="submit"
                        className='w-full'
                    >
                        Login
                    </Button>
                </form>
            </Form>
        </CardWrapper>
       
    )
}

