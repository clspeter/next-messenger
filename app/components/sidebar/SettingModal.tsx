'use client'

import axios from 'axios';
import { CldUploadButton } from 'next-cloudinary';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import Button from '@/app/components/inputs/Button';
import Input from '@/app/components/inputs/Input';
import { User } from '@prisma/client';

import Modal from '../Model';

interface SettingModalProps {
    isOpen?: boolean;
    onClose: () => void;
    currentUser: User;
}


const SettingModal: React.FC<SettingModalProps> = ({ isOpen, onClose, currentUser }) => {
    const router = useRouter();
    const [isLoading, setIsloading] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: {
        errors, }
    } = useForm<FieldValues>({
        defaultValues: {
            name: currentUser?.name,
            image: currentUser?.image,
        }
    });

    const image = watch('image')

    const handleUpload = (result: any) => {
        setValue('image', result?.info?.secure_url), {
            shouldValidate: true,
        }
    }

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        setIsloading(true);

        axios.post('/api/settings', data)
            .then(() => {
                router.refresh();
                onClose();
            }).catch((error) => toast.error(error.message))
            .finally(() => setIsloading(false))
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base font-semibold leading-7 text-gray-900">Profile</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">Edit your public information.</p>
                        <div className="mt-10 flex flex-col gap-y-8">
                            <Input disabled={isLoading} label="Name" id="name" errors={errors} required register={register} />
                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">Photo</label>
                                <div className="mt-2 flex items-center gap-x-3">
                                    <Image width="48" height="48" className="rounded-full" src={image || currentUser?.image || '/images/placeholder.png'} alt="Avatar" />
                                    <CldUploadButton options={{ maxFiles: 1 }} onUpload={handleUpload} uploadPreset="c2hjkj0d" >
                                        <Button disabled={isLoading} secondary type="button">
                                            Change
                                        </Button>
                                    </CldUploadButton>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-x-6">
                        <Button disabled={isLoading} secondary onClick={onClose}>Cancel</Button>
                        <Button disabled={isLoading} type="submit">Save</Button>
                    </div>

                </div>
            </form>
        </Modal>
    );
}

export default SettingModal;