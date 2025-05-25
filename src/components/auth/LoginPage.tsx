import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Mail, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../hooks/useToast';
import { motion } from 'framer-motion';
import { Loading } from '../ui/Loading';

interface LoginFormData {
  email: string;
  password: string;
  mfaCode?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  
  const from = location.state?.from?.pathname || "/";
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const result = await auth.login(data.email, data.password);

      if (result.requiresMFA) {
        setShowMFA(true);
        addToast({
          title: 'Verificação em duas etapas',
          message: 'Digite o código enviado para seu dispositivo',
          type: 'info'
        });
      } else {
        addToast({
          title: 'Login realizado com sucesso',
          type: 'success'
        });
        navigate(from, { replace: true });
      }
    } catch (error) {
      addToast({
        title: 'Erro ao fazer login',
        message: error.message,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/pwa-192x192.png"
          alt="Sistema de Inspeções"
        />
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sistema de Inspeções
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Faça login para acessar o sistema
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Input
                label="E-mail"
                type="email"
                {...register('email', { 
                  required: 'E-mail é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "E-mail inválido"
                  }
                })}
                error={errors.email?.message}
                icon={<Mail size={18} className="text-gray-400" />}
              />
            </motion.div>

            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <Input
                label="Senha"
                type="password"
                {...register('password', { 
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'A senha deve ter no mínimo 6 caracteres'
                  }
                })}
                error={errors.password?.message}
                icon={<Lock size={18} className="text-gray-400" />}
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Lembrar-me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Esqueceu a senha?
                  </a>
                </div>
              </div>
            </motion.div>

            {showMFA && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <Input
                  label="Código de Verificação"
                  {...register('mfaCode', { required: 'Código é obrigatório' })}
                  error={errors.mfaCode?.message}
                  placeholder="Digite o código de 6 dígitos"
                />
              </motion.div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loading size="sm" className="mr-2" />
                ) : (
                  <ArrowRight size={18} className="mr-2" />
                )}
                {showMFA ? 'Verificar' : 'Entrar'}
              </Button>
            </div>
          </form>
          
          <motion.div 
            className="mt-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Acesso de Demonstração
                </span>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start">
                <AlertTriangle size={20} className="text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Credenciais de Teste</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>E-mail: <code className="font-mono">tecnico@exemplo.com</code></p>
                    <p>Senha: <code className="font-mono">123456</code></p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}