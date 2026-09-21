import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'

interface LoginForm {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

function validate(form: LoginForm): FormErrors {
  const errors: FormErrors = {}

  if (!form.email.trim()) {
    errors.email = 'E-mail é obrigatório.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Informe um e-mail válido.'
  }

  if (!form.password) {
    errors.password = 'Senha é obrigatória.'
  } else if (form.password.length < 6) {
    errors.password = 'A senha deve ter pelo menos 6 caracteres.'
  }

  return errors
}

export default function Login() {
  const navigate = useNavigate()

  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    const updated = { ...form, [name]: value }
    setForm(updated)
    if (submitted) setErrors(validate(updated))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

        {/* Logo / Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-900 mb-4">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Entrar na conta</h1>
          <p className="text-sm text-gray-500 mt-1">Bem-vindo de volta!</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* E-mail */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
              placeholder="seu@email.com"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                errors.email
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-gray-400'
              }`}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              aria-describedby={errors.password ? 'password-error' : undefined}
              aria-invalid={!!errors.password}
              placeholder="••••••••"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                errors.password
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-gray-400'
              }`}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-xs text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          {/* Esqueceu a senha */}
          <div className="text-right">
            <a href="#" className="text-xs text-gray-500 hover:text-gray-900 transition hover:underline">
              Esqueceu a senha?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-black active:bg-gray-800 text-white font-semibold py-2.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-gray-900 font-semibold hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
