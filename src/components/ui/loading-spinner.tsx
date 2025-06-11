export default function LoadingSpinner() {
  return (
    <div className="relative">
      <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
      <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 rounded-full animate-ping opacity-20"></div>
    </div>
  )
}