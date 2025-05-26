import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Mail, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../lib/auth';
import { PageTransition } from '../../components/layout/PageTransition';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await auth.login(data.email, data.password);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sistema de Inspeções
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Faça login para acessar o sistema
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-md shadow-sm -space-y-px">
              <Input
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
                type="email"
                placeholder="Email"
                error={errors.email?.message}
                leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              />

              <Input
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter no mínimo 6 caracteres',
                  },
                })}
                type="password"
                placeholder="Senha"
                error={errors.password?.message}
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
              />
            </div>

            {auth.error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{auth.error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Entrar
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500">
            <p>
              Para demonstração, use:
              <br />
              Email: tecnico@exemplo.com
              <br />
              Senha: 123456
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
