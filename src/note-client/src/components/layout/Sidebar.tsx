import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { text: 'Notes', icon: '📝', path: '/notes' },
  { text: 'Tools', icon: '🛠️', path: '/tools' },
  { text: 'Analytics', icon: '📊', path: '/analytics' },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 600) {
      onClose();
    }
  };

  return (
    <aside
      className={`fixed top-16 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full overflow-y-auto">
        <nav className="mt-5">
          <ul>
            {menuItems.map((item) => (
              <li key={item.text}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-100 ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.text}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 my-4"></div>
          <ul>
            <li>
              <button
                onClick={() => handleNavigation('/settings')}
                className={`w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-100 ${
                  location.pathname === '/settings'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700'
                }`}
              >
                <span className="text-xl">⚙️</span>
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
