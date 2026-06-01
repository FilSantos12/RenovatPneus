import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, User, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Navega após o React commitar o estado de autenticação
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);

    try {
      await login(username, password);
      toast.success('Login realizado com sucesso!');
      // navegação ocorre via useEffect acima
    } catch {
      setError(true);
      setLoading(false);
      toast.error('Usuário ou senha incorretos');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#111111] relative overflow-hidden">
        {/* Subtle tire pattern background */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`,
          }} />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="mb-8">
            <div className="w-32 h-32 bg-[#F97316] rounded-3xl flex items-center justify-center mb-6">
              <span className="text-white text-6xl font-['Barlow_Condensed'] font-bold">R</span>
            </div>
            <h1 className="text-5xl font-['Barlow_Condensed'] font-bold tracking-wide text-center">
              RENOVAT<br />PNEUS
            </h1>
          </div>
          <p className="text-2xl text-white/80 text-center">
            Bem-vindo de volta
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-block w-20 h-20 bg-[#F97316] rounded-2xl flex items-center justify-center mb-4">
              <span className="text-white text-4xl font-['Barlow_Condensed'] font-bold">R</span>
            </div>
            <h1 className="text-3xl font-['Barlow_Condensed'] font-bold tracking-wide text-[#111111]">
              RENOVAT PNEUS
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
              Acessar Sistema
            </h2>
            <p className="text-[#2D2D2D]/60">
              Digite suas credenciais para entrar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-[#2D2D2D] font-medium mb-2">
                Usuário
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D2D2D]/40" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full h-14 pl-12 pr-4 bg-[#F5F5F5] border-2 rounded-xl focus:outline-none focus:border-[#F97316] transition-colors ${
                    error ? 'border-[#EF4444]' : 'border-transparent'
                  }`}
                  placeholder="Digite seu usuário"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#2D2D2D] font-medium mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D2D2D]/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full h-14 pl-12 pr-12 bg-[#F5F5F5] border-2 rounded-xl focus:outline-none focus:border-[#F97316] transition-colors ${
                    error ? 'border-[#EF4444]' : 'border-transparent'
                  }`}
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2D2D2D]/40 hover:text-[#2D2D2D] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444] rounded-xl">
                <p className="text-[#EF4444] text-sm">
                  Usuário ou senha incorretos
                </p>
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-[#2D2D2D]/20 text-[#F97316] focus:ring-[#F97316] focus:ring-offset-0"
              />
              <label htmlFor="remember" className="ml-2 text-[#2D2D2D]">
                Manter conectado
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#F97316] text-white rounded-xl font-medium hover:bg-[#F97316]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-[#F5F5F5] rounded-xl">
            <p className="text-sm text-[#2D2D2D]/60 mb-2">Credenciais de demonstração:</p>
            <div className="space-y-1 text-sm text-[#2D2D2D]">
              <p><strong>Admin:</strong> admin / password</p>
              <p><strong>Operador:</strong> operador1 / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
