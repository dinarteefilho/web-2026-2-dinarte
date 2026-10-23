// frontend/src/pages/Chat.tsx
// Chat com o Gemini via WebSocket autenticado (API Gateway WebSocket + Cognito).
//
// A URL do WebSocket pode vir do frontend/.env (VITE_WS_URL=wss://...).
// Se a variável não existir (por exemplo, em um build feito em outro lugar),
// usa o domínio padrão definido abaixo.

import { useEffect, useRef, useState } from 'react'
import { fetchAuthSession } from 'aws-amplify/auth'

interface Mensagem {
  autor: 'Eu' | 'IA' | 'Erro'
  texto: string
}

type Status = 'conectando' | 'conectado' | 'desconectado' | 'erro'

const WS_URL =
  (import.meta.env.VITE_WS_URL as string | undefined) ??
  'wss://api.dinarte.zangado.web.ufersa.dev.br'

// O API Gateway corta a integração em 29 s; se nada chegar antes disso, libera a tela.
const TEMPO_MAXIMO_RESPOSTA_MS = 35000

const corStatus: Record<Status, string> = {
  conectado: 'bg-green-100 text-green-700',
  conectando: 'bg-yellow-100 text-yellow-700',
  desconectado: 'bg-gray-200 text-gray-600',
  erro: 'bg-red-100 text-red-700',
}

export default function ChatBotIA() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [inputTexto, setInputTexto] = useState('')
  const [status, setStatus] = useState<Status>('conectando')
  const [aguardando, setAguardando] = useState(false)
  const [reconexao, setReconexao] = useState(0)
  const ws = useRef<WebSocket | null>(null)
  const fimRef = useRef<HTMLDivElement>(null)
  const timerEspera = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // `cancelado` evita conexão duplicada no React StrictMode (dev):
    // o efeito roda duas vezes e, como a conexão é assíncrona, a primeira
    // ficaria aberta sem ninguém para fechá-la.
    let cancelado = false

    const liberarEspera = () => {
      if (timerEspera.current) {
        clearTimeout(timerEspera.current)
        timerEspera.current = null
      }
      setAguardando(false)
    }

    async function iniciarConexao() {
      try {
        const sessao = await fetchAuthSession()
        // accessToken -> use TOKEN_USE=access no authorizer
        // (se preferir idToken, troque aqui e use TOKEN_USE=id na Lambda)
        const token = sessao.tokens?.accessToken?.toString()

        if (!token) {
          // O login pelo botão do Google NÃO gera sessão do Cognito
          setStatus('erro')
          setMensagens([
            {
              autor: 'Erro',
              texto: 'Sem sessão do Cognito. Entre com e-mail e senha e tente de novo.',
            },
          ])
          return
        }
        if (cancelado) return

        // O navegador não permite header Authorization em WebSocket,
        // então o token vai na query string (o authorizer lê "token").
        const socket = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`)
        ws.current = socket

        socket.onopen = () => {
          console.log('Conexão WebSocket estabelecida')
          if (ws.current === socket) setStatus('conectado')
        }

        socket.onmessage = (event) => {
          liberarEspera()
          try {
            const dados = JSON.parse(event.data)
            const texto: string = dados.resposta ?? dados.message ?? ''
            // Erro enviado pela Lambda (type: "error") ou pelo próprio API Gateway (só "message")
            const ehErro =
              dados.type === 'error' ||
              (dados.resposta === undefined && dados.message !== undefined)
            setMensagens((prev) => [
              ...prev,
              { autor: ehErro ? 'Erro' : 'IA', texto },
            ])
          } catch {
            setMensagens((prev) => [...prev, { autor: 'IA', texto: String(event.data) }])
          }
        }

        socket.onclose = () => {
          console.log('Conexão fechada')
          if (ws.current === socket) {
            setStatus('desconectado')
            liberarEspera()
          }
        }

        socket.onerror = (err) => {
          console.error('Erro no WebSocket:', err)
          if (ws.current === socket) {
            setStatus('erro')
            liberarEspera()
          }
        }
      } catch (err) {
        console.error('Erro de autenticação:', err)
        setStatus('erro')
      }
    }

    iniciarConexao()

    return () => {
      cancelado = true
      if (timerEspera.current) {
        clearTimeout(timerEspera.current)
        timerEspera.current = null
      }
      const socket = ws.current
      ws.current = null
      socket?.close()
    }
  }, [reconexao])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, aguardando])

  function reconectar() {
    setStatus('conectando')
    setAguardando(false)
    setReconexao((n) => n + 1)
  }

  function enviarMensagem() {
    const texto = inputTexto.trim()
    const socket = ws.current
    if (!texto || aguardando || !socket || socket.readyState !== WebSocket.OPEN) return

    setMensagens((prev) => [...prev, { autor: 'Eu', texto }])

    // Qualquer valor de "action" sem rota correspondente cai na rota $default.
    socket.send(JSON.stringify({ action: 'sendMessage', message: texto }))

    setInputTexto('')
    setAguardando(true)

    if (timerEspera.current) clearTimeout(timerEspera.current)
    timerEspera.current = setTimeout(() => {
      timerEspera.current = null
      setAguardando(false)
      setMensagens((prev) => [
        ...prev,
        { autor: 'Erro', texto: 'A resposta demorou demais. Tente novamente.' },
      ])
    }, TEMPO_MAXIMO_RESPOSTA_MS)
  }

  const conectado = status === 'conectado'

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Chatbot IA (Gemini)</h2>
        <div className="flex items-center gap-2">
          {(status === 'desconectado' || status === 'erro') && (
            <button
              onClick={reconectar}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Reconectar
            </button>
          )}
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${corStatus[status]}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
        {mensagens.length === 0 && (
          <p className="text-sm text-gray-400">Faça uma pergunta para começar.</p>
        )}
        {mensagens.map((msg, index) => (
          <div key={index} className={`flex ${msg.autor === 'Eu' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.autor === 'Eu'
                  ? 'bg-blue-500 text-white'
                  : msg.autor === 'Erro'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-200 text-gray-800'
              }`}
            >
              <strong className="block text-xs opacity-75 mb-1">{msg.autor}</strong>
              <span className="whitespace-pre-wrap">{msg.texto}</span>
            </div>
          </div>
        ))}
        {aguardando && <p className="text-xs text-gray-400">Gerando resposta…</p>}
        <div ref={fimRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputTexto}
          onChange={(e) => setInputTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviarMensagem()}
          disabled={!conectado}
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="Escreva a sua mensagem..."
        />
        <button
          onClick={enviarMensagem}
          disabled={!conectado || aguardando}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}