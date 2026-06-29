import Link from "next/link";
import { Building2, Camera } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-57px)] max-w-lg flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-warm-brown">Create your account</h1>
      <p className="mt-2 text-sm text-warm-gray">
        Join InfluConnect as a brand looking for creators, or as a creator ready for collabs.
      </p>

      <div className="mt-8 grid gap-4">
        <Link
          href="/signup/brand"
          className="flex items-start gap-4 rounded-2xl border border-cream-dark bg-white p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-terracotta/10">
            <Building2 className="h-6 w-6 text-terracotta" />
          </div>
          <div>
            <p className="font-semibold text-warm-brown">I&apos;m a Brand</p>
            <p className="mt-1 text-sm text-warm-gray">
              Cloud kitchen, restaurant, or cafe looking for local Instagram creators.
            </p>
          </div>
        </Link>

        <Link
          href="/signup/creator"
          className="flex items-start gap-4 rounded-2xl border border-cream-dark bg-white p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sage/20">
            <Camera className="h-6 w-6 text-sage-dark" />
          </div>
          <div>
            <p className="font-semibold text-warm-brown">I&apos;m a Creator</p>
            <p className="mt-1 text-sm text-warm-gray">
              Food or lifestyle influencer — claim your profile and get discovered by brands.
            </p>
          </div>
        </Link>
      </div>

      <p className="mt-8 text-center text-sm text-warm-gray">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-terracotta hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
