import React, { useEffect, useState } from 'react';
import { rtdb } from '../../config/firebase.config';
import { ref, get } from 'firebase/database';
import { AdminRole } from '../../types/admin';
import { AdminDashboard } from './AdminDashboard';

interface AdminProtectedRouteProps {
  currentUid: string;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ currentUid }) => {
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUid) {
        setLoading(false);
        return;
      }

      try {
        const snapshot = await get(ref(rtdb, `admins/${currentUid}`));
        if (snapshot.exists()) {
          const adminData = snapshot.val();
          setRole(adminData.role as AdminRole);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error("Error verifying admin role:", err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [currentUid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Verifying Administrative Access...
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-slate-900 border border-rose-500/30 p-6 rounded-xl max-w-md w-full space-y-3">
          <h1 className="text-xl font-bold text-rose-500">🚫 Access Denied</h1>
          <p className="text-xs text-slate-400">
            You do not have permission to view the Admin Dashboard.
          </p>
        </div>
      </div>
    );
  }

  return <AdminDashboard adminUid={currentUid} adminRole={role} />;
};

