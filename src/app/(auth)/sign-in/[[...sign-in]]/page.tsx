"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-neutral-900 border border-neutral-800 shadow-2xl rounded-2xl w-full",
              headerTitle: "text-white text-2xl font-bold",
              headerSubtitle: "text-neutral-400",
              socialButtonsBlockButton: "bg-neutral-950 border border-neutral-800 text-white hover:bg-neutral-800",
              socialButtonsBlockButtonText: "text-white font-medium",
              dividerLine: "bg-neutral-800",
              dividerText: "text-neutral-500",
              formFieldLabel: "text-neutral-300",
              formFieldInput: "bg-neutral-950 border-neutral-800 text-white focus:ring-indigo-500 focus:border-indigo-500",
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white",
              footerActionText: "text-neutral-400",
              footerActionLink: "text-indigo-400 hover:text-indigo-300"
            }
          }}
        />
      </div>
    </div>
  );
}
