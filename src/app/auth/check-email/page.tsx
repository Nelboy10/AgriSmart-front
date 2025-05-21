export default function CheckEmailPage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-white px-4">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 space-y-6 border border-gray-100 text-center">
          <h2 className="text-2xl font-bold text-green-700">Vérifiez votre email</h2>
          <p className="text-gray-700">
            Un lien d’activation a été envoyé à votre adresse email.<br />
            Veuillez vérifier votre boîte de réception et cliquer sur le lien pour activer votre compte.
          </p>
        </div>
      </div>
    );
  }