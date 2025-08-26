import React from 'react';
import { FileText, Menu, X } from 'lucide-react';
import { useMobile } from '../hooks/useMobile';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showMenu?: boolean;
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  title, 
  subtitle, 
  showMenu = false, 
  onMenuToggle,
  menuOpen = false 
}) => {
  const { isNative, platform, hapticFeedback } = useMobile();

  const handleMenuToggle = () => {
    hapticFeedback();
    onMenuToggle?.();
  };

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${isNative ? 'pt-safe' : ''}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {showMenu && (
              <button
                onClick={handleMenuToggle}
                className="mr-3 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors md:hidden"
              >
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-xs text-gray-500 hidden sm:block">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
          
          {isNative && (
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                platform === 'ios' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {platform === 'ios' ? 'iOS' : 'Android'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;