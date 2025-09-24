export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="flex items-center gap-3 text-gray-700">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pokemon-blue"></div>
        <span>Carregando...</span>
      </div>
    </div>
  )
}


