import { useNavigate, Link } from 'react-router-dom'
import { Folder, HardDrive, Upload, Download } from 'lucide-react'
import ChatBotIA from './Chat'

interface FileItem {
  id: number
  name: string
  size: string
  type: string
  uploadedAt: string
  status: 'concluído' | 'processando' | 'erro'
}

const MOCK_FILES: FileItem[] = [
  { id: 1, name: 'relatorio_2026.pdf', size: '2.4 MB',  type: 'PDF',  uploadedAt: '21/09/2026', status: 'concluído'   },
  { id: 2, name: 'foto_perfil.png',    size: '512 KB',  type: 'PNG',  uploadedAt: '20/09/2026', status: 'concluído'   },
  { id: 3, name: 'dados.xlsx',         size: '1.1 MB',  type: 'XLSX', uploadedAt: '19/09/2026', status: 'processando' },
  { id: 4, name: 'backup.zip',         size: '8.7 MB',  type: 'ZIP',  uploadedAt: '18/09/2026', status: 'erro'        },
]

const STATUS_STYLES: Record<FileItem['status'], string> = {
  concluído:   'bg-gray-100 text-gray-700',
  processando: 'bg-gray-200 text-gray-600',
  erro:        'bg-red-100 text-red-600',
}

function FileTypeIcon({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold bg-gray-100 text-gray-600">
      {type}
    </span>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()

  const stats = [
    { label: 'Total de arquivos',   value: '24',     Icon: Folder    },
    { label: 'Armazenamento usado', value: '1.2 GB', Icon: HardDrive },
    { label: 'Uploads este mês',    value: '8',      Icon: Upload    },
    { label: 'Downloads este mês',  value: '15',     Icon: Download  },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">FileApp</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/dashboard" className="text-gray-900 border-b-2 border-gray-900 pb-0.5">
            Dashboard
          </Link>
          <Link to="/upload" className="text-gray-500 hover:text-gray-900 transition">
            Upload
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm">
              U
            </div>
            <span className="text-sm font-medium text-gray-700">Usuário</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-900 transition font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 rounded px-2 py-1"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Page title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gerencie seus arquivos e uploads</p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Novo upload
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <stat.Icon className="w-5 h-5 text-gray-400 mb-2" aria-hidden="true" />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent files */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-12">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Arquivos recentes</h2>
            <span className="text-xs text-gray-400">{MOCK_FILES.length} arquivos</span>
          </div>

          {/* Table — desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Arquivo</th>
                  <th className="text-left px-6 py-3 font-medium">Tipo</th>
                  <th className="text-left px-6 py-3 font-medium">Tamanho</th>
                  <th className="text-left px-6 py-3 font-medium">Data</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                  <th className="text-right px-6 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_FILES.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileTypeIcon type={file.type} />
                        <span className="font-medium text-gray-900 truncate max-w-[180px]">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{file.type}</td>
                    <td className="px-6 py-4 text-gray-500">{file.size}</td>
                    <td className="px-6 py-4 text-gray-500">{file.uploadedAt}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[file.status]}`}>
                        {file.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-gray-400 hover:text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-gray-300 rounded p-1"
                        aria-label={`Baixar ${file.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </button>
                      <button
                        className="ml-2 text-gray-400 hover:text-red-500 transition focus:outline-none focus:ring-2 focus:ring-red-200 rounded p-1"
                        aria-label={`Excluir ${file.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards — mobile */}
          <ul className="sm:hidden divide-y divide-gray-100">
            {MOCK_FILES.map((file) => (
              <li key={file.id} className="px-4 py-4 flex items-center gap-3">
                <FileTypeIcon type={file.type} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{file.size} · {file.uploadedAt}</p>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[file.status]}`}>
                  {file.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Chatbot IA */}
        <section>
          <ChatBotIA />
        </section>

      </main>
    </div>
  )
}