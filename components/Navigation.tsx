'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faHome, faFlask, faChalkboardTeacher, faUser } from '@fortawesome/free-solid-svg-icons';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: '/referencias', label: 'Referencias de la Investigación', shortLabel: 'Investigación', icon: faFlask },
    { href: '/presentacion', label: 'Referencias de la Presentación', shortLabel: 'Presentación', icon: faChalkboardTeacher },
    { href: '/desarrollo', label: 'Artículos Desarrollados', shortLabel: 'Autor', icon: faUser },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between py-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
            <span>Inicio</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                  pathname === link.href
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FontAwesomeIcon icon={link.icon} className="w-4 h-4" />
                <span>{link.shortLabel}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between py-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-gray-900 dark:text-white"
            >
              <FontAwesomeIcon icon={faHome} className="w-5 h-5" />
              <span className="text-lg">Inicio</span>
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              aria-label="Toggle menu"
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="pb-4 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-lg font-semibold transition-all duration-200 ${
                    pathname === link.href
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <FontAwesomeIcon icon={link.icon} className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
