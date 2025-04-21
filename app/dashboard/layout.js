"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    {
      title: "داشبورد",
      href: "/dashboard",
      icon: "🏠",
    },
    {
      title: "ابلاغ ماموریت",
      href: "/dashboard/missionOrder",
      icon: "🚗",
      submenu: [
        {
          title: "لیست ماموریت‌ها",
          href: "/dashboard/missionOrder",
          icon: "📋",
        },
        {
          title: "ایجاد ماموریت جدید",
          href: "/dashboard/missionOrder/create",
          icon: "✏️",
        },
      ],
    },
    {
      title: "تنظیمات",
      href: "/dashboard/settings",
      icon: "⚙️",
      submenu: [
        {
          title: "مدیریت مراکز",
          href: "/dashboard/settings/unit-locations",
          icon: "📍",
        },
        {
          title: "مدیریت نرخ‌ها",
          href: "/dashboard/settings/rate-settings",
          icon: "💰",
        },
      ],
    },
  ];

  const isActive = (path) => pathname === path || pathname.startsWith(path + "/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500">
      {/* Header */}
      <header className="bg-white/95 shadow-lg backdrop-blur-sm">
        <div className="px-0 sm:px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isSidebarOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">آریا فولاد قرن</h1>
                <p className="text-sm text-gray-500">سامانه ابلاغ حکم ماموریت</p>
              </div>
            </div>
            <div className="text-gray-700">
              خوش آمدید 👋
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className={`
            fixed lg:static inset-y-0 right-0 z-50
            transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
            lg:translate-x-0 transition-transform duration-300 ease-in-out
            w-64 bg-white/95 shadow-lg backdrop-blur-sm rounded-none sm:rounded-lg
          `}>
            <nav className="p-4 h-full overflow-y-auto">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <div className="mb-2">
                      <Link
                        href={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center p-2 rounded-lg hover:bg-gray-100 ${
                          isActive(item.href) 
                            ? "bg-gray-100 text-gray-900 font-medium" 
                            : "text-gray-600"
                        }`}
                      >
                        <span className="ml-2">{item.icon}</span>
                        {item.title}
                      </Link>
                    </div>
                    {item.submenu && (
                      <ul className="mr-6 space-y-2 border-r border-gray-200 pr-4">
                        {item.submenu.map((subitem) => (
                          <li key={subitem.href}>
                            <Link
                              href={subitem.href}
                              onClick={() => setIsSidebarOpen(false)}
                              className={`flex items-center p-2 rounded-lg hover:bg-gray-100 ${
                                isActive(subitem.href) 
                                  ? "bg-gray-100 text-gray-900 font-medium" 
                                  : "text-gray-600"
                              }`}
                            >
                              <span className="ml-2">{subitem.icon}</span>
                              {subitem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-none sm:rounded-lg shadow-sm p-0 sm:p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 