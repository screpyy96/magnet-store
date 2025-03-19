import NotificationsPanel from './NotificationsPanel';

export default function AdminNavbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo și navigare */}
            {/* ... */}
          </div>
          
          <div className="flex items-center">
            {/* Componentă notificări */}
            <NotificationsPanel />
            
            {/* Alte elemente UI */}
            {/* ... */}
          </div>
        </div>
      </div>
    </nav>
  );
} 