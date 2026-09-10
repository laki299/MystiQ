import React, { useEffect, useState } from 'react';
import { rtdb } from '../../config/firebase.config';
import { ref, get } from 'firebase/database';
import { AdminRole } from '../../types/admin';
import { AdminDashboard } from './AdminDashboard';

interface AdminProtectedRouteProps {
  currentUid: string;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = function (
  props
) {
  var currentUid = props.currentUid;
  var roleState = useState(null as AdminRole | null);
  var role = roleState[0];
  var setRole = roleState[1];
  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  useEffect(
    function () {
      async function checkAdminStatus() {
        if (!currentUid) {
          setLoading(false);
          return;
        }
        try {
          // 1) Check users/{uid}/role  (new system)
          var userSnap = await get(ref(rtdb, 'users/' + currentUid + '/role'));
          if (userSnap.exists()) {
            var userRole = String(userSnap.val());
            if (userRole === 'admin' || userRole === 'super_admin') {
              setRole('super_admin');
              setLoading(false);
              return;
            }
          }

          // 2) Fallback: old admins/{uid} node
          var adminSnap = await get(ref(rtdb, 'admins/' + currentUid));
          if (adminSnap.exists()) {
            var val = adminSnap.val();
            var r =
              val && val.role ? (val.role as AdminRole) : 'super_admin';
            setRole(r);
          } else {
            setRole(null);
          }
        } catch (err) {
          console.error('Error verifying admin role:', err);
          setRole(null);
        } finally {
          setLoading(false);
        }
      }
      checkAdminStatus();
    },
    [currentUid]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Verifying admin access...
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-slate-900 border border-rose-500/30 p-6 rounded-xl max-w-md w-full space-y-3">
          <h1 className="text-xl font-bold text-rose-500">Access Denied</h1>
          <p className="text-xs text-slate-400">
            You do not have permission to view the Admin Dashboard.
          </p>
          <p className="text-[10px] text-slate-600 break-all">UID: {currentUid}</p>
        </div>
      </div>
    );
  }

  return <AdminDashboard adminUid={currentUid} adminRole={role} />;
};
