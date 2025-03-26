'use client'
import React from "react";
import { useState } from 'react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Redirect on successful login
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center p-20">
            <form onSubmit={handleSubmit} className="w-full p-10 bg-base-300 border border-base-300 rounded-box">
                {error && <div className="text-red-600">{error}</div>}
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
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </fieldset>
            </form>
        </div>
    )
}

export default Login;