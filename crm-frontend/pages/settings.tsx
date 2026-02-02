import { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../utils/useAuth';
import { settingsAPI, Settings } from '../services/api';
import { FaBell, FaShieldAlt, FaPalette, FaCheck, FaTimes, FaSync } from 'react-icons/fa';

const SettingsPage: React.FC = () => {
  const { isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'privacy' | 'display'>('notifications');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (category: 'notifications' | 'privacy', key: string, value: boolean) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    };
    setSettings(updatedSettings);
    
    try {
      await settingsAPI.update({ [category]: { [key]: value } });
      setMessage({ type: 'success', text: 'Settings updated!' });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('Failed to update settings:', error);
      setMessage({ type: 'error', text: 'Failed to update settings' });
    }
  };

  const handleDisplayChange = async (key: string, value: string) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      display: {
        ...settings.display,
        [key]: value,
      },
    };
    setSettings(updatedSettings);
    
    try {
      await settingsAPI.update({ display: updatedSettings.display });
      setMessage({ type: 'success', text: 'Settings updated!' });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('Failed to update settings:', error);
      setMessage({ type: 'error', text: 'Failed to update settings' });
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to default?')) return;
    
    setSaving(true);
    try {
      const response = await settingsAPI.reset();
      setSettings(response.data);
      setMessage({ type: 'success', text: 'Settings reset to default!' });
    } catch (error) {
      console.error('Failed to reset settings:', error);
      setMessage({ type: 'error', text: 'Failed to reset settings' });
    } finally {
      setSaving(false);
    }
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-14 h-7 rounded-full transition-colors ${
        enabled ? 'bg-blue-500' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          enabled ? 'translate-x-8' : 'translate-x-1'
        }`}
      />
    </button>
  );

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Settings - CRM Pro</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <div className="ml-64">
          <Navbar title="Settings" />
          
          <main className="p-8">
            <div className="max-w-3xl mx-auto">
              {/* Message */}
              {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.type === 'success' ? <FaCheck /> : <FaTimes />}
                  {message.text}
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
                      activeTab === 'notifications'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <FaBell />
                    <span className="hidden sm:inline">Notifications</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('privacy')}
                    className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
                      activeTab === 'privacy'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <FaShieldAlt />
                    <span className="hidden sm:inline">Privacy</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('display')}
                    className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
                      activeTab === 'display'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <FaPalette />
                    <span className="hidden sm:inline">Display</span>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {activeTab === 'notifications' && settings && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-800">Email Notifications</p>
                          <p className="text-sm text-slate-500">Receive email updates about your activity</p>
                        </div>
                        <ToggleSwitch 
                          enabled={settings.notifications.emailNotifications}
                          onChange={(v) => handleToggle('notifications', 'emailNotifications', v)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-800">Push Notifications</p>
                          <p className="text-sm text-slate-500">Receive push notifications in your browser</p>
                        </div>
                        <ToggleSwitch 
                          enabled={settings.notifications.pushNotifications}
                          onChange={(v) => handleToggle('notifications', 'pushNotifications', v)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-800">Sales Alerts</p>
                          <p className="text-sm text-slate-500">Get notified about new sales and updates</p>
                        </div>
                        <ToggleSwitch 
                          enabled={settings.notifications.salesAlerts}
                          onChange={(v) => handleToggle('notifications', 'salesAlerts', v)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-800">Target Alerts</p>
                          <p className="text-sm text-slate-500">Get notified about target progress and completion</p>
                        </div>
                        <ToggleSwitch 
                          enabled={settings.notifications.targetAlerts}
                          onChange={(v) => handleToggle('notifications', 'targetAlerts', v)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-800">System Updates</p>
                          <p className="text-sm text-slate-500">Receive updates about system maintenance</p>
                        </div>
                        <ToggleSwitch 
                          enabled={settings.notifications.systemUpdates}
                          onChange={(v) => handleToggle('notifications', 'systemUpdates', v)}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'privacy' && settings && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-800">Show Email</p>
                          <p className="text-sm text-slate-500">Allow others to see your email address</p>
                        </div>
                        <ToggleSwitch 
                          enabled={settings.privacy.showEmail}
                          onChange={(v) => handleToggle('privacy', 'showEmail', v)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-800">Show Phone</p>
                          <p className="text-sm text-slate-500">Allow others to see your phone number</p>
                        </div>
                        <ToggleSwitch 
                          enabled={settings.privacy.showPhone}
                          onChange={(v) => handleToggle('privacy', 'showPhone', v)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-800">Show Performance</p>
                          <p className="text-sm text-slate-500">Allow others to see your performance metrics</p>
                        </div>
                        <ToggleSwitch 
                          enabled={settings.privacy.showPerformance}
                          onChange={(v) => handleToggle('privacy', 'showPerformance', v)}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'display' && settings && (
                    <div className="space-y-6">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="font-semibold text-slate-800 mb-3">Theme</p>
                        <div className="flex gap-3">
                          {['light', 'dark', 'system'].map((theme) => (
                            <button
                              key={theme}
                              onClick={() => handleDisplayChange('theme', theme)}
                              className={`flex-1 py-3 px-4 rounded-xl font-medium capitalize transition-all ${
                                settings.display.theme === theme
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                              }`}
                            >
                              {theme}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <label className="font-semibold text-slate-800 mb-3 block">Currency</label>
                        <select
                          value={settings.display.currency}
                          onChange={(e) => handleDisplayChange('currency', e.target.value)}
                          className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="INR">INR (₹)</option>
                          <option value="JPY">JPY (¥)</option>
                        </select>
                      </div>
                      
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <label className="font-semibold text-slate-800 mb-3 block">Date Format</label>
                        <select
                          value={settings.display.dateFormat}
                          onChange={(e) => handleDisplayChange('dateFormat', e.target.value)}
                          className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                      
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <label className="font-semibold text-slate-800 mb-3 block">Language</label>
                        <select
                          value={settings.display.language}
                          onChange={(e) => handleDisplayChange('language', e.target.value)}
                          className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="zh">Chinese</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Reset Button */}
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <button
                      onClick={handleReset}
                      disabled={saving}
                      className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaSync className={saving ? 'animate-spin' : ''} />
                      Reset to Default Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
