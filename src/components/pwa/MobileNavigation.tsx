'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, User, Ticket, Settings } from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  matchPaths?: string[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Home',
    matchPaths: ['/dashboard'],
  },
  {
    href: '/profile/registrations',
    icon: Ticket,
    label: 'Tickets',
    matchPaths: ['/profile/registrations', '/tickets'],
  },
  {
    href: '/profile',
    icon: User,
    label: 'Profile',
    matchPaths: ['/profile'],
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'Settings',
    matchPaths: ['/settings'],
  },
];

export default function MobileNavigation() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some(path => {
        if (path === '/profile' && pathname === '/profile') return true;
        if (path === '/profile/registrations' && pathname.startsWith('/profile/registrations')) return true;
        return pathname === path;
      });
    }
    return pathname === item.href;
  };

  return (
    <nav className="mobile-nav md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item no-select ${active ? 'active' : ''}`}
            >
              <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
