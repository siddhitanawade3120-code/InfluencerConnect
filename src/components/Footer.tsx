import Link from "next/link";
import { Users, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-cream-dark bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta text-white">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-warm-brown">InfluConnect</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-warm-gray">
              Creators register with Instagram. Small businesses sign up, filter the directory,
              and send deal requests — a local marketplace for Vasai-Virar.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-warm-brown">
              For brands
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-warm-gray">
              <li>
                <Link href="/results" className="hover:text-terracotta">
                  Browse creators
                </Link>
              </li>
              <li>
                <Link href="/signup/brand" className="hover:text-terracotta">
                  Create brand account
                </Link>
              </li>
              <li>
                <Link href="/dashboard/brand" className="hover:text-terracotta">
                  Brand dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-warm-brown">
              For creators
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-warm-gray">
              <li>
                <Link href="/signup/creator" className="hover:text-terracotta">
                  Join as creator
                </Link>
              </li>
              <li>
                <Link href="/dashboard/creator" className="hover:text-terracotta">
                  Creator dashboard
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@influconnect.in"
                  className="inline-flex items-center gap-1.5 hover:text-terracotta"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Get support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-cream-dark pt-8 text-sm text-warm-gray sm:flex-row">
          <p>© {new Date().getFullYear()} InfluConnect · Vasai-Virar, Mumbai</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-terracotta">
              Sign in
            </Link>
            <Link href="/signup" className="font-medium text-terracotta hover:underline">
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
