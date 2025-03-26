'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) {
                throw new Error(authError.message);
            }

            // Force a page reload to ensure middleware runs and session is detected
            window.location.href = '/dashboard';
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center p-20">
            <form onSubmit={handleSubmit} className="w-full p-10 bg-base-300 border border-base-300 rounded-box">
                {error && <div className="alert alert-error mb-4">{error}</div>}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-2xl">Login</legend>

                    <label className="fieldset-label text-xl text-slate-200" htmlFor="email">Correo</label>
                    <input
                        id="email"
                        type="email"
                        className="input w-full"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label className="fieldset-label text-xl text-slate-200" htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        className="input w-full"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        className="btn btn-neutral mt-4"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading loading-spinner"></span>
                                Procesando...
                            </>
                        ) : 'Iniciar sesión'}
                    </button>
                    <a className="btn btn-link mt-2" href='/register'>Registro</a>
                </fieldset>
            </form>
        </div>
    )
}

export default Login;