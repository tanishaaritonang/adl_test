export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <div className="max-w-md rounded-lg bg-slate-800 p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="mb-6 text-slate-300">
          {
            "You don't have permission to access this page. Please contact your administrator if you believe this is an error."
          }
        </p>
        <a
          href="/"
          className="bg-btn-background hover:bg-btn-background-hover inline-block rounded-md px-4 py-2 no-underline"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}
