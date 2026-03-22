import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Salle de Sport</h1>
          <p className="text-gray-600 mt-2">Créez votre compte</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-[4px_4px_0px_var(--color-foreground)] rounded-none-none",
            }
          }}
        />
      </div>
    </div>
  );
}
