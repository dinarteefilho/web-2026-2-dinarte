import { useState, useRef, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'

interface UploadForm {
  title: string
  description: string
  file: File | null
}

interface FormErrors {
  title?: string
  description?: string
  file?: string
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'application/pdf', 'application/zip',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
const MAX_SIZE_MB = 20
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

function validate(form: UploadForm): FormErrors {
  const errors: FormErrors = {}

  if (!form.title.trim()) {
    errors.title = 'Título é obrigatório.'
  } else if (form.title.trim().length < 3) {
    errors.title = 'Título deve ter pelo menos 3 caracteres.'
  } else if (form.title.trim().length > 100) {
    errors.title = 'Título deve ter no máximo 100 caracteres.'
  }

  if (form.description && form.description.length > 300) {
    errors.description = 'Descrição deve ter no máximo 300 caracteres.'
  }

  if (!form.file) {
    errors.file = 'Selecione um arquivo para enviar.'
  } else if (!ALLOWED_TYPES.includes(form.file.type)) {
    errors.file = 'Tipo de arquivo não permitido. Use PNG, JPEG, GIF, PDF, ZIP ou XLSX.'
  } else if (form.file.size > MAX_SIZE_BYTES) {
    errors.file = `O arquivo deve ter no máximo ${MAX_SIZE_MB} MB.`
  }

  return errors
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Upload() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<UploadForm>({ title: '', description: '', file: null })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleTextChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    const updated = { ...form, [name]: value }
    setForm(updated)
    if (submitted) setErrors(validate(updated))
  }

  function applyFile(file: File) {
    const updated = { ...form, file }
    setForm(updated)
    if (submitted) setErrors(validate(updated))
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) applyFile(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) applyFile(file)
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  function removeFile() {
    const updated = { ...form, file: null }
    setForm(updated)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (submitted) setErrors(validate(updated))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setUploading(true)
    await new Promise((res) => setTimeout(res, 1500))
    setUploading(false)
    setSuccess(true)

    setTimeout(() => navigate('/dashboard'), 1500)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 flex flex-col items-center gap-4 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Upload realizado!</h2>
          <p className="text-sm text-gray-500">Redirecionando para o Dashboard…</p>
        </div>
      </div>
    )
  }

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
          <Link to="/dashboard" className="text-gray-500 hover:text-gray-900 transition">
            Dashboard
          </Link>
          <Link to="/upload" className="text-gray-900 border-b-2 border-gray-900 pb-0.5">
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

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Enviar arquivo</h1>
          <p className="text-sm text-gray-500 mt-0.5">Faça upload de um novo arquivo para o seu espaço</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleTextChange}
              aria-describedby={errors.title ? 'title-error' : undefined}
              aria-invalid={!!errors.title}
              placeholder="Nome descritivo para o arquivo"
              maxLength={100}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                errors.title ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-gray-400'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.title ? (
                <p id="title-error" className="text-xs text-red-500">{errors.title}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-400">{form.title.length}/100</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleTextChange}
              aria-describedby={errors.description ? 'description-error' : undefined}
              aria-invalid={!!errors.description}
              placeholder="Descreva brevemente o conteúdo do arquivo…"
              rows={3}
              maxLength={300}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 resize-none transition ${
                errors.description ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:ring-gray-400'
              }`}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p id="description-error" className="text-xs text-red-500">{errors.description}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-400">{form.description.length}/300</span>
            </div>
          </div>

          {/* Drop zone */}
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">
              Arquivo <span className="text-red-500" aria-hidden="true">*</span>
            </p>

            {form.file ? (
              /* Selected file preview */
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{form.file.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(form.file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  aria-label="Remover arquivo"
                  className="text-gray-400 hover:text-red-500 transition focus:outline-none focus:ring-2 focus:ring-red-200 rounded p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              /* Drop zone */
              <div
                role="button"
                tabIndex={0}
                aria-label="Área de upload — clique ou arraste um arquivo"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-10 px-6 cursor-pointer transition select-none ${
                  dragging
                    ? 'border-gray-500 bg-gray-100'
                    : errors.file
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-500 hover:bg-gray-100'
                }`}
              >
                <svg className={`w-10 h-10 ${dragging ? 'text-gray-700' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm font-medium text-gray-700">
                  {dragging ? 'Solte aqui' : 'Arraste um arquivo ou clique para selecionar'}
                </p>
                <p className="text-xs text-gray-400">PNG, JPEG, GIF, PDF, ZIP, XLSX — máx. {MAX_SIZE_MB} MB</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.gif,.pdf,.zip,.xlsx"
              onChange={handleFileChange}
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
            />

            {errors.file && (
              <p className="mt-1 text-xs text-red-500">{errors.file}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition px-4 py-2.5 rounded-lg border border-gray-300 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
            >
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Enviando…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Enviar arquivo
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
