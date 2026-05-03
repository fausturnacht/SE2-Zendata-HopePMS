import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useRights } from '../../contexts/UserRightsContext';
import { getPendingUsers, fetchAllUsers, approveUser, rejectUser, activateUser, deactivateUser } from '../../api/users';
import { Download, CheckCircle2, XCircle, Search, Filter, Shield, Ban, Power } from 'lucide-react';

export default function UserManagementPage() {
  const { hasRight } = useRights();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingActive, setLoadingActive] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  if (!hasRight('ADM_USER')) {
    return <Navigate to="/dashboard" replace />;
  }

  const loadData = async () => {
    try {
      setLoadingPending(true);
      const pending = await getPendingUsers();
      setPendingUsers(pending || []);
    } catch (e) {
      console.error(e);
      setPendingUsers([]);
    } finally {
      setLoadingPending(false);
    }

    try {
      setLoadingActive(true);
      const all = await fetchAllUsers();
      setActiveUsers(all || []);
    } catch (e) {
      console.error(e);
      setActiveUsers([]);
    } finally {
      setLoadingActive(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    setActionInProgress(`approve-${id}`);
    try {
      await approveUser(id);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionInProgress(`reject-${id}`);
    try {
      await rejectUser(id);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleActivate = async (id: string) => {
    setActionInProgress(`activate-${id}`);
    try {
      await activateUser(id);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeactivate = async (id: string) => {
    setActionInProgress(`deactivate-${id}`);
    try {
      await deactivateUser(id);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['User ID', 'Username', 'Email', 'User Type', 'Status'];
    const csvRows = [
      headers.join(','),
      ...activeUsers.map(user => {
        const id = user.id || user.userid || '';
        const username = `"${(user.username || '').replace(/"/g, '""')}"`;
        const email = `"${(user.email || '').replace(/"/g, '""')}"`;
        const type = user.user_type || '';
        const status = user.record_status === 'ACTIVE' ? 'Active' : 'Suspended';
        return [id, username, email, type, status].join(',');
      })
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `User_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 max-w-full">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.05em] mb-2">Administration Console</p>
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-slate-900 leading-tight tracking-tight">User Management</h2>
        </div>
        <button 
          onClick={handleExportCSV}
          className="px-5 py-2.5 bg-white text-slate-700 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Download className="w-5 h-5" />
          Export List
        </button>
      </header>

      {/* Pending Authorization Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Pending Authorization</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">{pendingUsers.length} Requests</span>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4 font-medium">User ID</th>
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Requested Role</th>
                <th className="px-6 py-4 font-medium">Date Requested</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loadingPending ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading pending requests...</td>
                </tr>
              ) : pendingUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No pending authorization requests</td>
                </tr>
              ) : pendingUsers.map(user => (
                <tr key={user.id || user.userid} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{user.id || user.userid || '—'}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{user.username || '—'}</td>
                  <td className="px-6 py-4 text-slate-500">{user.email}</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">{user.user_type || '—'}</span></td>
                  <td className="px-6 py-4 text-slate-500">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button 
                      onClick={() => handleApprove(user.id || user.userid)}
                      disabled={actionInProgress === `approve-${user.id || user.userid}`}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50" title="Approve">
                        {actionInProgress === `approve-${user.id || user.userid}` ? <span className="w-5 h-5 block animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></span> : <CheckCircle2 className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => handleReject(user.id || user.userid)}
                      disabled={actionInProgress === `reject-${user.id || user.userid}`}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50" title="Reject">
                         {actionInProgress === `reject-${user.id || user.userid}` ? <span className="w-5 h-5 block animate-spin rounded-full border-2 border-rose-600 border-t-transparent"></span> : <XCircle className="w-5 h-5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Active Users Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h3 className="text-lg font-bold text-slate-900">Active Users</h3>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none w-full sm:w-64 placeholder:text-slate-400 transition-all shadow-sm" placeholder="Search ID or Name" type="text"/>
            </div>
            <button className="px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4 font-medium">User ID</th>
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">User Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loadingActive ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : activeUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No active users found</td>
                </tr>
              ) : activeUsers.map(user => {
                const isSuperAdmin = user.user_type === 'SUPERADMIN';
                const isActive = user.record_status === 'ACTIVE';
                const id = user.id || user.userid;
                
                return (
                <tr key={id} className={`hover:bg-slate-50/50 transition-colors ${isSuperAdmin ? 'bg-slate-50/30' : ''}`}>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{id || '—'}</td>
                  <td className={`px-6 py-4 font-medium flex items-center gap-2 ${isSuperAdmin ? 'text-slate-900 font-bold' : 'text-slate-900'}`}>
                    {user.username || user.email}
                    {isSuperAdmin && <Shield className="w-4 h-4 text-blue-600" />}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs justify-center rounded-full font-medium inline-flex ${isSuperAdmin ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                      {user.user_type || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'border border-slate-400 bg-transparent'}`}></div>
                      <span className={isActive ? 'text-slate-900' : 'text-slate-500'}>{isActive ? 'Active' : 'Suspended'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2 relative group">
                    {isSuperAdmin ? (
                      <div className="relative group/tooltip">
                        <button disabled className="px-3 py-1.5 text-slate-400 bg-slate-50 border border-slate-200 rounded cursor-not-allowed opacity-60 flex items-center gap-1 text-xs font-semibold">
                          <Ban className="w-4 h-4" /> Deactivate
                        </button>
                        <div className="absolute bottom-full right-0 mb-2 hidden group-hover/tooltip:block w-48 bg-slate-900 text-white text-xs p-2 rounded shadow-lg text-center z-10">
                          SUPERADMIN accounts cannot be modified
                        </div>
                      </div>
                    ) : isActive ? (
                      <button 
                        onClick={() => handleDeactivate(id)}
                        disabled={actionInProgress === `deactivate-${id}`}
                        className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-all text-xs font-semibold flex items-center gap-1 disabled:opacity-50">
                        {actionInProgress === `deactivate-${id}` ? <span className="w-4 h-4 block animate-spin rounded-full border border-rose-600 border-t-transparent"></span> : <Ban className="w-4 h-4" />} Deactivate
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleActivate(id)}
                        disabled={actionInProgress === `activate-${id}`}
                        className="px-3 py-1.5 text-emerald-600 hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-200 transition-all text-xs font-semibold flex items-center gap-1 disabled:opacity-50">
                        {actionInProgress === `activate-${id}` ? <span className="w-4 h-4 block animate-spin rounded-full border border-emerald-600 border-t-transparent"></span> : <Power className="w-4 h-4" />} Activate
                      </button>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
