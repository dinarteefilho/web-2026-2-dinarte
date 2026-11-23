// Avatar do usuário para a barra superior: mostra a foto salva em GET /profile
// ou, se não houver foto, a inicial do nome/e-mail.

import { useEffect, useState } from 'react'
import { fetchAuthSession } from 'aws-amplify/auth'

interface PerfilResumo {
  nome?: string
  email?: string
  foto?: string | null
}

const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'https://emvuiak1q2.execute-api.us-east-1.amazonaws.com'
).replace(/\/$/, '')

export default function Avatar({ tamanho = 32 }: { tamanho?: number }) {
  const [perfil, setPerfil] = useState<PerfilResumo | null>(null)

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      try {
        const sessao = await fetchAuthSession()
        const token = sessao.tokens?.idToken?.toString()
        if (!token) return
        const resposta = await fetch(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!resposta.ok) return
        const dados = (await resposta.json()) as PerfilResumo
        if (!cancelado) setPerfil(dados)
      } catch {
        // sem foto: mantém a inicial
      }
    }
    carregar()
    return () => {
      cancelado = true
    }
  }, [])

  const inicial = (perfil?.nome || perfil?.email || 'U').charAt(0).toUpperCase()
  const estilo = { width: tamanho, height: tamanho }

  if (perfil?.foto) {
    return (
      <img
        src={perfil.foto}
        alt="Foto de perfil"
        style={estilo}
        className="rounded-full object-cover border border-gray-200"
      />
    )
  }

  return (
    <div
      style={estilo}
      className="rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm"
    >
      {inicial}
    </div>
  )
}