// frontend/src/pages/Profile.tsx
// Perfil do usuário: edita nome, telefone, bio e foto (PUT /profile) e mostra os dados salvos (GET /profile).
//
// A URL da API (HTTP API do API Gateway) vem do frontend/.env (VITE_API_URL=https://...),
// ou do valor padrão abaixo. Troque SEU_ID_DA_API pelo ID da sua API.

import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { fetchAuthSession } from 'aws-amplify/auth'

interface Perfil {
  cadastrado: boolean
  nome: string
  email: string
  telefone: string
  bio: string
  foto: string | null
  atualizadoEm: string | null
}

interface Aviso {
  tipo: 'ok' | 'erro'
  texto: string
}

const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'https://emvuiak1q2.execute-api.us-east-1.amazonaws.com'
).replace(/\/$/, '')

async function chamarApi<T>(metodo: 'GET' | 'PUT', corpo?: unknown): Promise<T> {
  // A API valida o idToken do Cognito (traz o e-mail verificado)
  const sessao = await fetchAuthSession()
  const token = sessao.tokens?.idToken?.toString()
  if (!token) {
    throw new Error('Sem sessão do Cognito. Entre com e-mail e senha e tente de novo.')
  }

  const resposta = await fetch(`${API_URL}/profile`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(corpo ? { 'Content-Type': 'application/json' } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  })

  const dados = await resposta.json().catch(() => ({}))
  if (!resposta.ok) {
    if (resposta.status === 401) {
      throw new Error('Sessão expirada. Saia e entre de novo.')
    }
    throw new Error(dados.erro ?? dados.message ?? `Erro ${resposta.status}`)
  }
  return dados as T
}

// Recorta a foto em quadrado, reduz para no máximo 512 px e converte para JPEG
// (assim o envio fica leve e dentro do limite da Lambda).
function reduzirImagem(arquivo: File, lado = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo)
    const img = new Image()
    img.onload = () => {
      const menor = Math.min(img.width, img.height)
      const sx = (img.width - menor) / 2
      const sy = (img.height - menor) / 2
      const tamanho = Math.min(lado, menor)
      const canvas = document.createElement('canvas')
      canvas.width = tamanho
      canvas.height = tamanho
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Não foi possível processar a imagem neste navegador.'))
        return
      }
      ctx.drawImage(img, sx, sy, menor, menor, 0, 0, tamanho, tamanho)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler a imagem escolhida.'))
    }
    img.src = url
  })
}

export default function PerfilUsuario() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [bio, setBio] = useState('')
  const [fotoNova, setFotoNova] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const inputArquivo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelado = false
    chamarApi<Perfil>('GET')
      .then((dados) => {
        if (cancelado) return
        setPerfil(dados)
        setNome(dados.nome)
        setTelefone(dados.telefone)
        setBio(dados.bio)
      })
      .catch((err: Error) => {
        if (!cancelado) setAviso({ tipo: 'erro', texto: err.message })
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
  }, [])

  async function escolherFoto(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    if (!arquivo.type.startsWith('image/')) {
      setAviso({ tipo: 'erro', texto: 'Escolha um arquivo de imagem (JPG, PNG ou WEBP).' })
      return
    }
    try {
      setFotoNova(await reduzirImagem(arquivo))
      setAviso(null)
    } catch (err) {
      setAviso({
        tipo: 'erro',
        texto: err instanceof Error ? err.message : 'Falha ao ler a imagem.',
      })
    }
  }

  async function salvar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setAviso(null)
    try {
      const dados = await chamarApi<Perfil>('PUT', {
        nome,
        telefone,
        bio,
        ...(fotoNova ? { foto: fotoNova } : {}),
      })
      setPerfil(dados)
      setNome(dados.nome)
      setTelefone(dados.telefone)
      setBio(dados.bio)
      setFotoNova(null)
      setAviso({ tipo: 'ok', texto: 'Perfil salvo com sucesso.' })
    } catch (err) {
      setAviso({
        tipo: 'erro',
        texto: err instanceof Error ? err.message : 'Não foi possível salvar.',
      })
    } finally {
      setSalvando(false)
    }
  }

  const fotoExibida = fotoNova ?? perfil?.foto ?? null
  const inicial = (nome || perfil?.email || '?').charAt(0).toUpperCase()

  if (carregando) {
    return <p className="p-6 text-center text-gray-500">Carregando perfil…</p>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Meu perfil</h1>
          <a href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline">
            Voltar ao dashboard
          </a>
        </div>

        {aviso && (
          <div
            className={`rounded-lg p-3 text-sm ${
              aviso.tipo === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {aviso.texto}
          </div>
        )}

        <form onSubmit={salvar} className="bg-white rounded-xl shadow-md p-6 space-y-5">
          <div className="flex items-center gap-4">
            {fotoExibida ? (
              <img
                src={fotoExibida}
                alt="Foto de perfil"
                className="h-24 w-24 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-900 text-white flex items-center justify-center text-3xl font-semibold">
                {inicial}
              </div>
            )}
            <div className="space-y-1">
              <input
                ref={inputArquivo}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={escolherFoto}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => inputArquivo.current?.click()}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Trocar foto
              </button>
              {fotoNova && (
                <p className="text-xs text-gray-500">Nova foto escolhida. Clique em Salvar.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={perfil?.email ?? ''}
              disabled
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              minLength={2}
              maxLength={80}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              maxLength={20}
              placeholder="(84) 99999-9999"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sobre você</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors disabled:opacity-50"
          >
            {salvando ? 'Salvando…' : 'Salvar perfil'}
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Informações cadastradas</h2>
          {perfil?.cadastrado ? (
            <dl className="grid grid-cols-3 gap-y-2 text-sm">
              <dt className="text-gray-500">Nome</dt>
              <dd className="col-span-2 text-gray-900">{perfil.nome}</dd>
              <dt className="text-gray-500">E-mail</dt>
              <dd className="col-span-2 text-gray-900">{perfil.email}</dd>
              <dt className="text-gray-500">Telefone</dt>
              <dd className="col-span-2 text-gray-900">{perfil.telefone || '—'}</dd>
              <dt className="text-gray-500">Sobre</dt>
              <dd className="col-span-2 text-gray-900 whitespace-pre-wrap">{perfil.bio || '—'}</dd>
              <dt className="text-gray-500">Atualizado em</dt>
              <dd className="col-span-2 text-gray-900">
                {perfil.atualizadoEm ? new Date(perfil.atualizadoEm).toLocaleString('pt-BR') : '—'}
              </dd>
            </dl>
          ) : (
            <p className="text-sm text-gray-500">
              Nenhuma informação cadastrada ainda. Preencha o formulário e salve.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}