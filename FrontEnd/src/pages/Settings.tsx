// =============================================
// ============== CODEX SETTINGS ==============
// =============================================
// Settings page component for C.H.A.O.S.
// MSN Messenger-inspired settings interface

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Moon, Sun, Image, Volume2, Bell } from 'lucide-react';

import MainLayout from '../components/layout/main-layout';
import { useAuth } from '../context/auth-context';
import { cn } from '../lib/utils';
import { Theme } from '../types';

/**
 * Settings Page Component
 * 
 * Provides MSN Messenger-style settings interface with:
 * - Theme customization (classic MSN, light, dark)
 * - Notification preferences
 * - Sound settings
 * - Profile settings
 * - Privacy options
 */
const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // Settings state
  const [activeTab, setActiveTab] = useState<'appearance'|'profile'|'notifications'|'privacy'>('appearance');
  const [theme, setTheme] = useState<Theme>('theme-msn-classic');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [encryptByDefault, setEncryptByDefault] = useState<boolean>(false);
  
  // Handle saving settings
  const handleSaveSettings = () => {
    // Here we would save settings to the server
    console.log('Saving settings...');
    
    // Navigate back to dashboard
    navigate('/');
  };
  
  return (
    <MainLayout 
      sidebar={
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Settings</h2>
            <p className="text-sm text-gray-500">Customize your C.H.A.O.S. experience</p>
          </div>
          <div className="flex-1">
            <nav className="p-2">
              <button
                onClick={() => setActiveTab('appearance')}
                className={cn(
                  "w-full text-left p-2 mb-1 rounded",
                  activeTab === 'appearance' 
                    ? "bg-msn-blue text-white" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                Appearance
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={cn(
                  "w-full text-left p-2 mb-1 rounded",
                  activeTab === 'profile' 
                    ? "bg-msn-blue text-white" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={cn(
                  "w-full text-left p-2 mb-1 rounded",
                  activeTab === 'notifications' 
                    ? "bg-msn-blue text-white" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={cn(
                  "w-full text-left p-2 mb-1 rounded",
                  activeTab === 'privacy' 
                    ? "bg-msn-blue text-white" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                Privacy
              </button>
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <button 
                onClick={() => navigate('/')}
                className="msn-button bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex-1"
              >
                <ArrowLeft size={16} className="mr-2" /> Back
              </button>
              <button 
                onClick={handleSaveSettings}
                className="msn-button bg-msn-blue hover:bg-msn-darkBlue text-white flex-1"
              >
                <Save size={16} className="mr-2" /> Save
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="h-full overflow-y-auto p-6">
        {/* Appearance settings */}
        {activeTab === 'appearance' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Appearance</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                {/* MSN Classic theme */}
                <div 
                  onClick={() => setTheme('theme-msn-classic')}
                  className={cn(
                    "border rounded-lg p-4 cursor-pointer transition-all",
                    theme === 'theme-msn-classic' 
                      ? "border-msn-blue ring-2 ring-msn-blue ring-opacity-50" 
                      : "border-gray-200 hover:border-msn-blue dark:border-gray-700"
                  )}
                >
                  <div className="h-20 bg-gradient-to-r from-msn-blue to-msn-lightBlue rounded mb-3"></div>
                  <p className="font-medium text-center">MSN Classic</p>
                </div>
                
                {/* Light theme */}
                <div 
                  onClick={() => setTheme('light')}
                  className={cn(
                    "border rounded-lg p-4 cursor-pointer transition-all",
                    theme === 'light' 
                      ? "border-msn-blue ring-2 ring-msn-blue ring-opacity-50" 
                      : "border-gray-200 hover:border-msn-blue dark:border-gray-700"
                  )}
                >
                  <div className="h-20 bg-white border rounded mb-3 flex items-center justify-center">
                    <Sun size={24} />
                  </div>
                  <p className="font-medium text-center">Light</p>
                </div>
                
                {/* Dark theme */}
                <div 
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "border rounded-lg p-4 cursor-pointer transition-all",
                    theme === 'dark' 
                      ? "border-msn-blue ring-2 ring-msn-blue ring-opacity-50" 
                      : "border-gray-200 hover:border-msn-blue dark:border-gray-700"
                  )}
                >
                  <div className="h-20 bg-gray-900 rounded mb-3 flex items-center justify-center">
                    <Moon size={24} className="text-white" />
                  </div>
                  <p className="font-medium text-center">Dark</p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Background</h3>
              <div className="grid grid-cols-4 gap-3">
                {/* Default background */}
                <div 
                  className={cn(
                    "h-16 border rounded cursor-pointer",
                    "bg-gray-50 dark:bg-gray-900",
                    "flex items-center justify-center"
                  )}
                >
                  Default
                </div>
                {/* Gradient background */}
                <div 
                  className="h-16 bg-gradient-to-r from-msn-blue to-msn-lightBlue border rounded cursor-pointer"
                ></div>
                {/* Custom background option */}
                <div 
                  className={cn(
                    "h-16 border rounded cursor-pointer",
                    "flex items-center justify-center",
                    "border-dashed"
                  )}
                >
                  <Image size={20} className="mr-2" /> Custom
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Profile settings */}
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Profile</h2>
            
            {user && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Name
                  </label>
                  <input 
                    type="text" 
                    className="msn-input w-full max-w-md"
                    defaultValue={user.displayName} 
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    About Me
                  </label>
                  <textarea 
                    className="msn-input w-full max-w-md h-24"
                    defaultValue="" 
                    placeholder="Tell others about yourself..."
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-msn-blue rounded-full flex items-center justify-center text-white text-xl">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.displayName} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.displayName.charAt(0)
                      )}
                    </div>
                    <button className="msn-button">
                      Change Picture
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Notifications settings */}
        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Notifications</h2>
            
            <div className="mb-6">
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <h3 className="font-medium">Enable Notifications</h3>
                  <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
                </div>
                <div className="h-6 w-11 bg-gray-200 rounded-full relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={notificationsEnabled}
                    onChange={e => setNotificationsEnabled(e.target.checked)}
                  />
                  <div
                    className={`absolute inset-y-0 left-0 w-6 h-6 rounded-full transition-all ${
                      notificationsEnabled ? 'bg-msn-blue translate-x-5' : 'bg-white'
                    }`}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <h3 className="font-medium">Sound Effects</h3>
                  <p className="text-sm text-gray-500">Play sounds for messages and notifications</p>
                </div>
                <div className="h-6 w-11 bg-gray-200 rounded-full relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={soundEnabled}
                    onChange={e => setSoundEnabled(e.target.checked)}
                  />
                  <div
                    className={`absolute inset-y-0 left-0 w-6 h-6 rounded-full transition-all ${
                      soundEnabled ? 'bg-msn-blue translate-x-5' : 'bg-white'
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Privacy settings */}
        {activeTab === 'privacy' && (
          <div>
            <h2 className="text-xl font-bold mb-6">Privacy</h2>
            
            <div className="mb-6">
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <h3 className="font-medium">Encrypt Messages by Default</h3>
                  <p className="text-sm text-gray-500">All messages will be encrypted end-to-end</p>
                </div>
                <div className="h-6 w-11 bg-gray-200 rounded-full relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={encryptByDefault}
                    onChange={e => setEncryptByDefault(e.target.checked)}
                  />
                  <div
                    className={`absolute inset-y-0 left-0 w-6 h-6 rounded-full transition-all ${
                      encryptByDefault ? 'bg-msn-blue translate-x-5' : 'bg-white'
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Settings;
