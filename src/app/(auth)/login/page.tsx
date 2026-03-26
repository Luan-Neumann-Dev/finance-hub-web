'use client';

import { extractErrorMessage } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { Wallet, Mail, Lock, User, AlertCircle} from 'lucide-react'
import { useState } from 'react';

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null)

    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")

    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regConfirm, setRegConfirm] = useState("");

    const {login, register} = useAuth();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login(loginEmail, loginPassword)
        } catch (err: unknown) {
            const message = extractErrorMessage(err);
            setError(message);
        } finally {
            setIsLoading(false)
        }
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();

        if (regPassword !== regConfirm) {
            setError("As senhas não coincidem");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            await register(regEmail, regPassword, regName);
        } catch (err: unknown) {
            const message = extractErrorMessage(err);
            setError(message);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md">
            
            {/* LOGO */}
            <div className="text-center mb-8 animate-fade-up">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg">
                    <Wallet className='w-8 h-8 text-primary-foreground' />
                </div>

                <h1 className='text-2xl font-bold text-foreground'>Finance Hub</h1>
                <p className='text-muted-foreground mt-1'>Gerencie suas finanças com facilidade</p>
            </div>

            {/* CARD */}
            <div className='bg-card border border-border rounded-2xl shadow-sm p-6 animate-fade-up' style={{animationDelay: "100ms"}}>
                {mode === 'login' ? (
                    <form onSubmit={handleLogin} className='space-y-4'>
                        <div>
                            <h2 className='text-xl font-semibold'>Bem-vindo de volta!</h2>
                            <p className='text-sm text-muted-foreground mt-1'>Entre com suas credenciais.</p>
                        </div>

                        {error && (
                            <div className='flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2'>
                                <AlertCircle className='w-4 h-4 shrink-0'/>
                                {error}
                            </div>
                        )}

                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Email</label>
                            <div className='relative'>
                                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground'/>
                                <input 
                                    type='email'
                                    placeholder='seu@email.com'
                                    className='w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Senha</label>
                            <div className='relative'>
                                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground'/>
                                <input 
                                    type='password'
                                    placeholder="••••••••"
                                    className='w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-sm focus-outline-none focus:ring-2 focus:ring-ring'
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type='submit'
                            disabled={isLoading}
                            className='w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60'
                        >
                            {isLoading ? "Entrando..." : "Entrar"}
                        </button>

                        <p className='text-center text-sm'>
                            <button
                                type='button'
                                onClick={() => {setMode('register'); setError(null)}}
                                className='text-primary hover:underline'
                            >
                                Não tem conta? Criar conta
                            </button>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className='space-y-4'>
                        <div>
                            <h2 className='text-xl font-semibold'>Crie sua conta</h2>
                            <p className='text-sm text-muted-foreground mt-1'>Preencha os dados abaixo.</p>
                        </div>

                        {error && (
                            <div className='flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2'>
                                <AlertCircle className='w-4 h-4 shrink-0' />
                            </div>
                        )}

                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Nome completo</label>
                            <div className='relative'>
                                <User className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                <input 
                                    type='text'
                                    placeholder='Luan Neumann'
                                    className='w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Email</label>
                            <div className='relative'>
                                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground'/>
                                <input 
                                    type='email'
                                    placeholder="seu@email.com"
                                    className='w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Senha</label>
                            <div className='relative'>
                                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                <input 
                                    type='password'
                                    placeholder='Mínimo 6 caracteres'
                                    className='w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    minLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Senha</label>
                            <div className='relative'>
                                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                <input 
                                    type='password'
                                    placeholder='••••••••'
                                    className='w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                                    value={regConfirm}
                                    onChange={(e) => setRegConfirm(e.target.value)}
                                    required
                                />
                            </div>
                            {regPassword && regConfirm && regPassword !== regConfirm && (
                                <p className='text-xs text-destructive'>As senhas nao coincidem</p>
                            )}
                        </div>

                        <button
                            type='submit'
                            disabled={isLoading || (!!regPassword && !!regConfirm && regPassword !== regConfirm)}
                            className='w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60'
                        >
                            {isLoading ? 'Criando conta...' : 'Criar conta'}
                        </button>

                        <p className='text-center text-sm'>
                            <button
                                type='button'
                                onClick={() => { setMode('login'); setError(null); }}
                                className='text-primary hover:underline'
                            >
                                Já tem conta? Entrar
                            </button>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}