'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Gerador de Provas' },
    { href: '/answer-sheet', label: 'Cartão-Resposta' },
    { href: '/history', label: 'Provas Geradas' }, // Exemplo de link futuro
    { href: '/profile', label: 'Meu Perfil' }, // Exemplo de link futuro
  ];

  return (
    <aside className="w-64 bg-white text-gray-800 p-4 shadow-lg no-print">
      <div className="text-2xl font-bold mb-8">Menu</div>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link href={item.href}>
                <div
                  className={`p-2 rounded-lg cursor-pointer hover:bg-indigo-100 ${pathname === item.href ? 'bg-indigo-200 font-semibold' : ''}`}
                >
                  {item.label}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
