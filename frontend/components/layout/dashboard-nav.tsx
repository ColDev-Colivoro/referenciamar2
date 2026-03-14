"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "@/lib/auth/use-session"

const ADMIN_ROLES = new Set(["global_admin", "tenant_admin"])

export function DashboardNav() {
  const { session } = useSession()
  const pathname = usePathname()
  const isAdmin = session ? ADMIN_ROLES.has(session.user.role) : false

  const links = [
    { href: "/dashboard/lots", label: "Lotes", show: true },
    { href: "/dashboard/audit", label: "Auditoría", show: isAdmin },
    { href: "/dashboard/billing", label: "Facturación", show: isAdmin },
  ]

  return (
    <nav className="flex gap-4 border-b border-gray-200 pb-3 mb-4">
      {links
        .filter((l) => l.show)
        .map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/")
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {l.label}
            </Link>
          )
        })}
    </nav>
  )
}
