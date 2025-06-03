import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import InviteCodeManager from '../components/admin/InviteCodeManager';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdminAuthenticated } = useAdminAuth();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAdminAuthenticated) {
        navigate('/admin/login');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('email', 'yashwanthbogam4@gmail.com')
          .single();

        if (error) throw error;
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      }
    };

    checkAdminStatus();
  }, [isAdminAuthenticated, navigate]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="bg-white dark:bg-navy-900 rounded-lg shadow-sm p-6">
        <InviteCodeManager />
      </div>
    </div>
  );
};

export default AdminPage;