import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, Copy, Check } from 'lucide-react';

interface InviteCode {
  id: string;
  code: string;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  usedBy: string | null;
}

const InviteManager: React.FC = () => {
  const { user } = useAuth();
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const generateInviteCode = async () => {
    // Implementation will be added when we connect to Supabase
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-navy-900 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Invite Codes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            You have {user?.availableInvites} invites remaining
          </p>
        </div>
        
        <button
          onClick={generateInviteCode}
          disabled={!user?.availableInvites}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Invite
        </button>
      </div>

      {inviteCodes.length > 0 ? (
        <div className="space-y-4">
          {inviteCodes.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-800 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <code className="text-sm font-mono">{invite.code}</code>
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
                <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock size={14} className="mr-1" />
                  <span>
                    Expires in {
                      Math.ceil(
                        (new Date(invite.expiresAt).getTime() - Date.now()) / 
                        (1000 * 60 * 60 * 24)
                      )
                    } days
                  </span>
                </div>
              </div>
              
              {invite.usedBy && (
                <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                  Used by {invite.usedBy}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No invite codes generated yet
        </div>
      )}
    </div>
  );
};

export default InviteManager;