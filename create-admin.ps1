# create-admin.ps1
Write-Host "Creating admin folder structure..." -ForegroundColor Green

# Create directories
$dirs = @(
    "app/admin/users",
    "app/admin/marketplace",
    "app/admin/transactions/deposits",
    "app/admin/transactions/withdrawals",
    "app/admin/transactions/transfers",
    "app/admin/revenue",
    "app/admin/security",
    "app/admin/support",
    "app/admin/settings",
    "app/admin/login"
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Force -Path $d | Out-Null }

# --- app/admin/layout.tsx ---
$layout = @"
"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaUsers,
  FaStore,
  FaExchangeAlt,
  FaChartLine,
  FaShieldAlt,
  FaHeadset,
  FaCog,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const sidebarItems = [
  { name: "Dashboard", icon: FaHome, href: "/admin" },
  { name: "User Management", icon: FaUsers, href: "/admin/users" },
  { name: "Marketplace Management", icon: FaStore, href: "/admin/marketplace" },
  {
    name: "Transactions",
    icon: FaExchangeAlt,
    href: "/admin/transactions",
    subItems: [
      { name: "Deposits", href: "/admin/transactions/deposits" },
      { name: "Withdrawals", href: "/admin/transactions/withdrawals" },
      { name: "Transfers", href: "/admin/transactions/transfers" },
    ],
  },
  { name: "Revenue & Analytics", icon: FaChartLine, href: "/admin/revenue" },
  { name: "Security Center", icon: FaShieldAlt, href: "/admin/security" },
  { name: "Support Center", icon: FaHeadset, href: "/admin/support" },
  { name: "System Settings", icon: FaCog, href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out ` +
          `\${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <span className="text-xl font-bold text-red-600">Admin Panel</span>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4 overflow-y-auto h-[calc(100vh-4rem)]">
          <ul className="space-y-1 px-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const hasSubItems = item.subItems && item.subItems.length > 0;

              return (
                <li key={item.name}>
                  {hasSubItems ? (
                    <>
                      <div
                        className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ` +
                          `\${isActive ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                      <ul className="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-3">
                        {item.subItems.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              href={sub.href}
                              className={`block rounded-md px-4 py-1.5 text-sm ` +
                                `\${pathname === sub.href ? "text-red-600 font-medium" : "text-gray-600 hover:text-red-600"}`}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-md px-4 py-2 text-sm font-medium ` +
                        `\${isActive ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"}`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between lg:justify-end">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FaBars className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Admin</span>
            <button className="rounded-full bg-red-600 px-4 py-1 text-sm text-white hover:bg-red-700">
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
"@
Set-Content -Path "app/admin/layout.tsx" -Value $layout

# --- app/admin/page.tsx ---
$dashboard = @"
"use client";

import { FaUsers, FaDollarSign, FaExchangeAlt, FaShieldAlt } from "react-icons/fa";

const stats = [
  { title: "Total Users", value: "12,384", icon: FaUsers, color: "bg-blue-500" },
  { title: "Revenue", value: "$48,295", icon: FaDollarSign, color: "bg-green-500" },
  { title: "Transactions", value: "1,849", icon: FaExchangeAlt, color: "bg-purple-500" },
  { title: "Security Alerts", value: "3", icon: FaShieldAlt, color: "bg-red-500" },
];

export default function AdminDashboard() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Overview of your platform activity</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-lg bg-white p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`rounded-full p-3 \${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 \${stat.color.replace("bg-", "text-")}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Recent Users</h3>
          <ul className="mt-4 divide-y divide-gray-100">
            <li className="py-2 flex justify-between text-sm">
              <span>John Doe</span>
              <span className="text-gray-400">2 min ago</span>
            </li>
            <li className="py-2 flex justify-between text-sm">
              <span>Jane Smith</span>
              <span className="text-gray-400">15 min ago</span>
            </li>
          </ul>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Recent Transactions</h3>
          <ul className="mt-4 divide-y divide-gray-100">
            <li className="py-2 flex justify-between text-sm">
              <span>Deposit: $500</span>
              <span className="text-gray-400">1 hour ago</span>
            </li>
            <li className="py-2 flex justify-between text-sm">
              <span>Withdrawal: $200</span>
              <span className="text-gray-400">3 hours ago</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
"@
Set-Content -Path "app/admin/page.tsx" -Value $dashboard

# --- Placeholder pages ---
$placeholder = @"
export default function Page() {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800">[Title]</h1>
      <p className="text-sm text-gray-500">[Description]</p>
      <div className="mt-6 rounded-lg bg-white p-6 shadow-sm border border-gray-100">
        <p className="text-gray-600">Coming soon…</p>
      </div>
    </>
  );
}
"@

# Replace [Title] and [Description] for each page
$pages = @{
    "app/admin/users/page.tsx" = @{ Title = "User Management"; Desc = "View and manage all registered users." }
    "app/admin/marketplace/page.tsx" = @{ Title = "Marketplace Management"; Desc = "Manage listings, orders, and sellers." }
    "app/admin/transactions/deposits/page.tsx" = @{ Title = "Deposits"; Desc = "View and manage all deposit transactions." }
    "app/admin/transactions/withdrawals/page.tsx" = @{ Title = "Withdrawals"; Desc = "View and manage all withdrawal requests." }
    "app/admin/transactions/transfers/page.tsx" = @{ Title = "Transfers"; Desc = "View and manage internal transfers." }
    "app/admin/revenue/page.tsx" = @{ Title = "Revenue & Analytics"; Desc = "Monitor revenue, charts, and reports." }
    "app/admin/security/page.tsx" = @{ Title = "Security Center"; Desc = "Manage security alerts, logs, and settings." }
    "app/admin/support/page.tsx" = @{ Title = "Support Center"; Desc = "Handle support tickets and inquiries." }
    "app/admin/settings/page.tsx" = @{ Title = "System Settings"; Desc = "Configure platform settings and preferences." }
}

foreach ($path in $pages.Keys) {
    $data = $pages[$path]
    $content = $placeholder -replace "\[Title\]", $data.Title -replace "\[Description\]", $data.Desc
    Set-Content -Path $path -Value $content
}

# --- Admin Login page ---
$login = @"
export default function AdminLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-red-600">Admin Login</h1>
        <form className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-red-600 py-2 text-white hover:bg-red-700"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
"@
Set-Content -Path "app/admin/login/page.tsx" -Value $login

# --- middleware.ts ---
$middleware = @"
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
"@
Set-Content -Path "middleware.ts" -Value $middleware

Write-Host "✅ Admin folder and pages created successfully!" -ForegroundColor Green
Write-Host "⚠️  Don't forget to install 'react-icons' if you haven't:" -ForegroundColor Yellow
Write-Host "   npm install react-icons" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  - Implement real authentication in middleware and admin/login"
Write-Host "  - Adjust the public navbar to hide on admin routes (see instructions)"
Write-Host "  - Replace placeholder data with real API calls"