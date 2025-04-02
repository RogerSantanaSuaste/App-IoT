'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Swal from 'sweetalert2';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Validate inputs
            if (!validateEmail(email)) {
                throw new Error('Por favor ingresa un correo electrónico válido');
            }
            if (password.length < 8) {
                throw new Error('La contraseña debe tener al menos 8 caracteres');
            }

            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name
                    },
                    emailRedirectTo: `${window.location.origin}/dashboard`
                }
            });

            if (authError) {
                throw new Error(authError.message);
            }

            await Swal.fire({
                title: '¡Registro exitoso!',
                text: 'Por favor revisa tu correo para confirmar tu cuenta.',
                icon: 'success',
                confirmButtonText: 'Entendido'
            });

            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error durante el registro');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center p-20">
            <form onSubmit={handleSubmit} className="w-full p-10 bg-base-300 border border-base-300 rounded-box">
                {error && <div className="alert alert-error mb-4">{error}</div>}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-2xl">Registro</legend>

                    <label className="fieldset-label text-xl text-slate-200" htmlFor="name">Nombre</label>
                    <input
                        id="name"
                        type="text"
                        className="input w-full"
                        placeholder="Tu nombre completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <label className="fieldset-label text-xl text-slate-200" htmlFor="email">Correo</label>
                    <input
                        id="email"
                        type="email"
                        className="input w-full"
                        placeholder="correo@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label className="fieldset-label text-xl text-slate-200" htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        className="input w-full"
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                    />

                    <button
                        className="btn btn-neutral mt-4"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading loading-spinner"></span>
                                Registrando...
                            </>
                        ) : 'Registrarse'}
                    </button>
                    <a className="btn btn-link mt-2" href='/'>¿Ya tienes cuenta? Inicia sesión</a>
                </fieldset>
            </form>
        </div>
    );
};

export default Register;