import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, Copy, Check, Ban, Trash2, Download } from 'lucide-react';

interface AdminInviteCode {
  id: string;
  code: string;
  createdAt: string;
  expiresAt: string | null;
  maxUses: number;
  useCount: number;
  status: 'active' | 'blocked';
  blockedAt: string | null;
  blockedBy: string | null;
}

const InviteCodeManager: React.FC = () => {
  const [inviteCodes, setInviteCodes] = useState<AdminInviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [maxUses, setMaxUses] = useState(1);
  const [expiryDays, setExpiryDays] = useState(7);

  useEffect(() => {
    loadInviteCodes();
  }, []);

  const loadInviteCodes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_invite_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInviteCodes(data);
    } catch (error) {
      console.error('Error loading invite codes:', error);
      setError('Failed to load invite codes');
    } finally {
      setIsLoading(false);
    }
  };

  const createInviteCode = async () => {
    try {
      const expiresAt = expiryDays > 0 
        ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase.rpc('create_invite_code', {
        p_max_uses: maxUses,
        p_expires_at: expiresAt
      });

      if (error) throw error;
      
      setInviteCodes(prev => [data, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating invite code:', error);
      setError('Failed to create invite code');
    }
  };

  const blockInviteCode = async (id: string) => {
    try {
      const { data, error } = await supabase.rpc('block_invite_code', {
        p_code_id: id
      });

      if (error) throw error;
      
      setInviteCodes(prev => 
        prev.map(code => code.id === id ? data : code)
      );
    } catch (error) {
      console.error('Error blocking invite code:', error);
      setError('Failed to block invite code');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportToCSV = () => {
    const headers = ['Code', 'Created At', 'Expires At', 'Max Uses', 'Use Count', 'Status'];
    const csvContent = [
      headers.join(','),
      ...inviteCodes.map(code => [
        code.code,
        code.createdAt,
        code.expiresAt || '',
        code.maxUses,
        code.useCount,
        code.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invite-codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 dark:bg-navy-800 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invite Codes</h2>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-navy-800 border border-gray-300 dark:border-navy-600 rounded-md hover:bg-gray-50 dark:hover:bg-navy-700 flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
          >
            Create Invite Code
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-50 dark:bg-navy-800 text-error-500 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {inviteCodes.map((invite) => (
          <div
            key={invite.id}
            className="bg-white dark:bg-navy-900 rounded-lg shadow-sm p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <code className="text-lg font-mono bg-gray-100 dark:bg-navy-800 px-2 py-1 rounded">
                  {invite.code}
                </code>
                <button
                  onClick={() => copyToClipboard(invite.code)}
                  className="p-1 hover:text-primary-500 transition-colors"
                  aria-label="Copy invite code"
                >
                  {copied === invite.code ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              {invite.status === 'active' && (
                <button
                  onClick={() => blockInviteCode(invite.id)}
                  className="p-2 text-error-500 hover:bg-error-50 dark:hover:bg-navy-800 rounded-md transition-colors"
                  aria-label="Block invite code"
                >
                  <Ban size={16} />
                </button>
              )}
            </div>

            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Uses: </span>
                <span className="font-medium">
                  {invite.useCount} / {invite.maxUses}
                </span>
              </div>

              {invite.expiresAt && (
                <div className="flex items-center">
                  <Clock size={14} className="mr-1 text-gray-400" />
                  <span>
                    Expires {new Date(invite.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div>
                <span className="text-gray-500 dark:text-gray-400">Status: </span>
                <span className={`font-medium ${
                  invite.status === 'active' 
                    ? 'text-success-500' 
                    : 'text-error-500'
                }`}>
                  {invite.status}
                </span>
              </div>

              <div>
                <span className="text-gray-500 dark:text-gray-400">Created: </span>
                <span>{new Date(invite.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Create Invite Code</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Maximum Uses
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxUses}
                  onChange={(e) => setMaxUses(parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Expiry (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set to 0 for no expiration
                </p>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-navy-800 rounded-md hover:bg-gray-200 dark:hover:bg-navy-700"
                >
                  Cancel
                </button>
                <button
                  onClick={createInviteCode}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InviteCodeManager;