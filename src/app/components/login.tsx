'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = correo/contraseña, 2 = pregunta de seguridad
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
    
        try {
            if (step === 1) {
                // First step - verify email/password
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
    
                const data = await response.json();
    
                if (!response.ok) {
                    throw new Error(data.message || 'Inicio de sesión fallido');
                }
    
                setSecurityQuestion(data.securityQuestion);
                setStep(2);
            } else {
                // Second step - verify security answer
                const response = await fetch('/api/auth/verify-2fa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, securityAnswer }),
                    credentials: 'include' // Important for cookies
                });
    
                const data = await response.json();
    
                if (!response.ok) {
                    throw new Error(data.message || 'Verificación de 2FA fallida');
                }
    
                // Store token in localStorage (optional, cookies are already set)
                localStorage.setItem('token', data.token);
                
                // Force a full page reload to ensure middleware runs
                window.location.href = '/dashboard';
            }
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

                    {step === 1 ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <div className="mb-4">
                                <p className="text-lg font-semibold">Pregunta de seguridad:</p>
                                <p className="text-slate-200">{securityQuestion}</p>
                            </div>
                            <label className="fieldset-label text-xl text-slate-200" htmlFor="securityAnswer">Respuesta</label>
                            <input
                                id="securityAnswer"
                                type="text"
                                className="input w-full"
                                placeholder="Your answer"
                                value={securityAnswer}
                                onChange={(e) => setSecurityAnswer(e.target.value)}
                                required
                            />
                        </>
                    )}

                    <button
                        className="btn btn-neutral mt-4"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : step === 1 ? 'Continuar' : 'Verificar'}
                    </button>
                    <a className="btn btn-link mt-2" href='/register'>Registro</a>
                </fieldset>
            </form>
        </div>
    )
}

export default Login;