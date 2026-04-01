'use client';

import React from 'react';
import { Settings, Shield, Bell, Lock, Globe } from 'lucide-react';

export default function AdminSettings() {
  const sections = [
    {
      title: 'Platform Visibility',
      description: 'Manage how the platform appears to the public.',
      icon: Globe,
      settings: [
        { label: 'Maintenance Mode', description: 'Temporarily disable store creation for all users.', type: 'toggle' },
        { label: 'Public Signups', description: 'Allow new users to register and create stores.', type: 'toggle', default: true },
      ]
    },
    {
      title: 'Security',
      description: 'Manage platform-wide security settings.',
      icon: Shield,
      settings: [
        { label: 'Two-Factor Authentication', description: 'Enforce 2FA for all store owners.', type: 'toggle' },
        { label: 'Admin IP Whitelist', description: 'Restrict admin access to specific IP addresses.', type: 'input', placeholder: 'Enter IPs separated by commas' },
      ]
    },
    {
      title: 'System Notifications',
      description: 'Configure how you receive system-wide alerts.',
      icon: Bell,
      settings: [
        { label: 'Email Alerts', description: 'Receive emails for new store registrations.', type: 'toggle', default: true },
        { label: 'Critical Errors', description: 'Receive notifications for system failures.', type: 'toggle', default: true },
      ]
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 mt-2">Manage global configurations for the Create Vendor platform.</p>
      </div>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <section.icon className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">{section.title}</h2>
                <p className="text-sm text-slate-500">{section.description}</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {section.settings.map((setting, sIdx) => (
                <div key={sIdx} className="flex items-center justify-between gap-8">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{setting.label}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{setting.description}</p>
                  </div>
                  {setting.type === 'toggle' ? (
                    <button className={`w-12 h-6 rounded-full transition-colors relative ${setting.default ? 'bg-red-500' : 'bg-slate-200'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${setting.default ? 'left-7' : 'left-1'}`} />
                    </button>
                  ) : (
                    <input 
                      type="text" 
                      placeholder={setting.placeholder}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none w-64"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <button className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
