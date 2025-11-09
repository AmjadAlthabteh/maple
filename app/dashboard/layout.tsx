import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Settings, BarChart3, Book, Mail } from 'lucide-react';
import { MapleLogo } from '@/components/ui/logo';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center space-x-2 p-6 border-b">
            <MapleLogo className="h-8 w-8" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Maple</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <NavLink href="/dashboard" icon={<MessageSquare />}>
              Conversations
            </NavLink>
            <NavLink href="/dashboard/analytics" icon={<BarChart3 />}>
              Analytics
            </NavLink>
            <NavLink href="/dashboard/knowledge" icon={<Book />}>
              Knowledge Base
            </NavLink>
            <NavLink href="/dashboard/email-accounts" icon={<Mail />}>
              Email Accounts
            </NavLink>
            <NavLink href="/dashboard/settings" icon={<Settings />}>
              Settings
            </NavLink>
          </nav>

          {/* User info */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {session.user?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <header className="bg-white border-b h-16 flex items-center px-6">
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <Link
              href="/api/auth/signout"
              className="text-sm text-gray-700 hover:text-blue-600 transition"
            >
              Sign Out
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="text-sm font-medium">{children}</span>
    </Link>
  );
}
