'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [securityQuestion, setSecurityQuestion] = useState('¿En qué ciudad naciste?');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const questions = [
        '¿En qué ciudad naciste?'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    name, 
                    securityQuestion, 
                    securityAnswer 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registro fallido.');
            }

            // Redirect to login after successful registration
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sucedió un error desconocido.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center p-20">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-10 bg-base-300 border border-base-300 rounded-box">
                <h2 className="text-2xl font-bold mb-6 text-center">Registro</h2>
                {error && <div className="alert alert-error mb-4">{error}</div>}
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">Nombre</label>
                        <input
                            type="text"
                            className="input w-full"
                            placeholder="Tú nombre"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">Correo</label>
                        <input
                            type="email"
                            className="input w-full"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">Contraseña</label>
                        <input
                            type="password"
                            className="input w-full"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">Pregunta de seguridad</label>
                        <select
                            className="select select-bordered w-full"
                            value={securityQuestion}
                            onChange={(e) => setSecurityQuestion(e.target.value)}
                            required
                        >
                            {questions.map((question, index) => (
                                <option key={index} value={question}>{question}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">Respuesta de seguridad</label>
                        <input
                            type="text"
                            className="input w-full"
                            placeholder="Tú respuesta"
                            value={securityAnswer}
                            onChange={(e) => setSecurityAnswer(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button
                        className="btn btn-primary w-full mt-6"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </div>
                
                <div className="mt-4 text-center">
                    <p className="text-sm text-slate-300">
                        ¿Ya tienes una cuenta?{' '}
                        <a href="/" className="text-blue-400 hover:underline">Inicio de sesión</a>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;