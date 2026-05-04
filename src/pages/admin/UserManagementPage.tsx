import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRights } from '../../contexts/UserRightsContext';
import { getPendingUsers, fetchAllUsers, activateUser, deactivateUser, preAuthorizeUser, updateUser } from '../../api/users';
import { Download, Search, Filter, Shield, Ban, Power, Edit, UserPlus, X, ChevronDown, ArrowUpDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserStampHistoryPanel } from '../../components/admin/UserStampHistoryPanel';

const PAGE_SIZE = 10;

export default function UserManagementPage() {
  const { currentUser } = useAuth();
  const { hasRight, loadingRights, isAdmin, isSuperAdmin } = useRights();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingActive, setLoadingActive] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);

  const [showPreAuthModal, setShowPreAuthModal] = useState(false);
  const [preAuthEmail, setPreAuthEmail] = useState('');
  const [preAuthName, setPreAuthName] = useState('');
  const [preAuthRole, setPreAuthRole] = useState<'USER' | 'ADMIN' | 'SUPERADMIN'>('USER');

  const [editingUser, setEditingUser] = useState<any>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editUserType, setEditUserType] = useState<'USER' | 'ADMIN' | 'SUPERADMIN'>('USER');

  if (loadingRights) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Checking permissions...</p>
      </div>
    );
  }

  if (!hasRight('ADM_USER')) {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredActiveUsers = useMemo(() => {
    let result = [...activeUsers];
    const searchLower = searchTerm.toLowerCase();

    // Search
    if (searchTerm) {
      result = result.filter(user => {
        const id = (user.id || user.userid || '').toLowerCase();
        const name = (user.username || user.email || '').toLowerCase();
        return id.includes(searchLower) || name.includes(searchLower);
      });
    }

    // Filter by role
    if (filterRole !== 'All') {
      result = result.filter(user => user.user_type === filterRole);
    }

    // Filter by status
    if (filterStatus === 'ACTIVE') {
      result = result.filter(user => user.record_status === 'ACTIVE');
    } else if (filterStatus === 'SUSPENDED') {
      result = result.filter(user => user.record_status !== 'ACTIVE');
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = (a[sortConfig.key] || '').toLowerCase();
        const bValue = (b[sortConfig.key] || '').toLowerCase();
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [activeUsers, searchTerm, filterRole, filterStatus, sortConfig]);

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

  useEffect(() => {
    setActiveCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus, sortConfig]);

  const handlePreAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionInProgress('preauth');
    try {
      await preAuthorizeUser(preAuthEmail, preAuthName, preAuthRole);
      setShowPreAuthModal(false);
      setPreAuthEmail('');
      setPreAuthName('');
      setPreAuthRole('USER');
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to pre-authorize user');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const id = editingUser.id || editingUser.userid;
    setActionInProgress(`edit-${id}`);
    try {
      await updateUser(id, { username: editUsername, user_type: editUserType });
      setEditingUser(null);
      await loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to update user');
    } finally {
      setActionInProgress(null);
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditUsername(user.username || user.email || '');
    setEditUserType(user.user_type || 'USER');
  };

  const handleToggleExpand = (userid: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [userid]: !prev[userid],
    }));
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

      {/* Active Users Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h3 className="text-lg font-bold text-slate-900">Active Users</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none w-full sm:w-64 placeholder:text-slate-400 transition-all shadow-sm" 
                placeholder="Search ID or Name" 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setFilterStatus(prev => prev === 'ALL' ? 'ACTIVE' : prev === 'ACTIVE' ? 'SUSPENDED' : 'ALL')}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium hover:bg-slate-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap min-w-[140px]"
            >
              <div className={`w-2 h-2 rounded-full ${filterStatus === 'ACTIVE' ? 'bg-emerald-500' : filterStatus === 'SUSPENDED' ? 'border border-slate-400 bg-transparent' : 'bg-blue-500'}`}></div>
              {filterStatus === 'ALL' ? 'All Users' : filterStatus === 'ACTIVE' ? 'Active Only' : 'Suspended Only'}
            </button>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none w-full sm:w-40 appearance-none cursor-pointer shadow-sm"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPERADMIN">SUPERADMIN</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none w-full sm:w-48 appearance-none cursor-pointer shadow-sm"
                value={sortConfig ? `${sortConfig.key}-${sortConfig.direction}` : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setSortConfig(null);
                  } else {
                    const [key, direction] = val.split('-');
                    setSortConfig({ key, direction: direction as 'asc' | 'desc' });
                  }
                }}
              >
                <option value="">Sort by...</option>
                <option value="username-asc">Name (A-Z)</option>
                <option value="username-desc">Name (Z-A)</option>
                <option value="user_type-asc">Role (A-Z)</option>
                <option value="user_type-desc">Role (Z-A)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
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
                {hasRight('STAMP') && <th className="px-6 py-4 font-medium">Stamp</th>}
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loadingActive ? (
                <tr>
                  <td colSpan={hasRight('STAMP') ? 6 : 5} className="px-6 py-8 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : filteredActiveUsers.length === 0 ? (
                <tr>
                  <td colSpan={hasRight('STAMP') ? 6 : 5} className="px-6 py-8 text-center text-slate-500">No users match your criteria</td>
                </tr>
              ) : filteredActiveUsers.slice((activeCurrentPage - 1) * PAGE_SIZE, activeCurrentPage * PAGE_SIZE).map((user: any) => {
                const isRowSuperAdmin = user.user_type === 'SUPERADMIN';
                const isActive = user.record_status === 'ACTIVE';
                const id = user.id || user.userid;
                const isSelfRow = currentUser && (id === currentUser.id || user.email === currentUser.email);
                
                return (
                <React.Fragment key={id}>
                <tr className={`hover:bg-slate-50/50 transition-colors ${isRowSuperAdmin ? 'bg-slate-50/30' : ''}`}>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{id || '—'}</td>
                  <td className={`px-6 py-4 font-medium flex items-center gap-2 ${isRowSuperAdmin ? 'text-slate-900 font-bold' : 'text-slate-900'}`}>
                    {user.username || user.email}
                    {isRowSuperAdmin && <Shield className="w-4 h-4 text-blue-600" />}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs justify-center rounded-full font-medium inline-flex ${isRowSuperAdmin ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                      {user.user_type || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'border border-slate-400 bg-transparent'}`}></div>
                      <span className={isActive ? 'text-slate-900' : 'text-slate-500'}>{isActive ? 'Active' : 'Suspended'}</span>
                    </div>
                  </td>
                  {hasRight('STAMP') && (
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {user.stamp || '—'}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 relative group">
                    <button
                      type="button"
                      onClick={() => handleToggleExpand(id)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      {expandedRows[id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {isRowSuperAdmin && !isSelfRow ? (
                      <div className="relative group/tooltip flex items-center gap-2">
                        <button disabled className="px-3 py-1.5 text-slate-400 bg-slate-50 border border-slate-200 rounded cursor-not-allowed opacity-60 flex items-center gap-1 text-xs font-semibold">
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button disabled className="px-3 py-1.5 text-slate-400 bg-slate-50 border border-slate-200 rounded cursor-not-allowed opacity-60 flex items-center justify-center gap-1 text-xs font-semibold min-w-[110px]">
                          <Ban className="w-4 h-4" /> Deactivate
                        </button>
                        <div className="absolute bottom-full right-0 mb-2 hidden group-hover/tooltip:block w-48 bg-slate-900 text-white text-xs p-2 rounded shadow-lg text-center z-10">
                          SUPERADMIN accounts cannot be modified
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-all text-xs font-semibold flex items-center gap-1">
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        {isActive ? (
                          <button 
                            onClick={() => handleDeactivate(id)}
                            disabled={actionInProgress === `deactivate-${id}` || isSelfRow}
                            className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200 transition-all text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed min-w-[110px]">
                            {actionInProgress === `deactivate-${id}` ? <span className="w-4 h-4 block animate-spin rounded-full border border-rose-600 border-t-transparent"></span> : <Ban className="w-4 h-4" />} Deactivate
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleActivate(id)}
                            disabled={actionInProgress === `activate-${id}` || isSelfRow}
                            className="px-3 py-1.5 text-emerald-600 hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-200 transition-all text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed min-w-[110px]">
                            {actionInProgress === `activate-${id}` ? <span className="w-4 h-4 block animate-spin rounded-full border border-emerald-600 border-t-transparent"></span> : <Power className="w-4 h-4" />} Activate
                          </button>
                        )}
                      </div>
                    )}
                    </div>
                  </td>
                </tr>
                <UserStampHistoryPanel
                  userId={id}
                  isOpen={!!expandedRows[id]}
                  colSpan={hasRight('STAMP') ? 6 : 5}
                />
                </React.Fragment>
              )})}
            </tbody>
          </table>
        </div>

        {/* Active Users Pagination */}
        {filteredActiveUsers.length > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between px-2">
            <p className="text-xs font-medium text-slate-500">
              Showing {(activeCurrentPage - 1) * PAGE_SIZE + 1}–{Math.min(activeCurrentPage * PAGE_SIZE, filteredActiveUsers.length)} of {filteredActiveUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveCurrentPage(p => Math.max(1, p - 1))}
                disabled={activeCurrentPage === 1}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-semibold text-slate-700 min-w-[3rem] text-center">
                Page {activeCurrentPage} of {Math.ceil(filteredActiveUsers.length / PAGE_SIZE)}
              </span>
              <button
                onClick={() => setActiveCurrentPage(p => Math.min(Math.ceil(filteredActiveUsers.length / PAGE_SIZE), p + 1))}
                disabled={activeCurrentPage === Math.ceil(filteredActiveUsers.length / PAGE_SIZE)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Pending Authorization Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-slate-900">Pending Authorization</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">{pendingUsers.length} Requests</span>
          </div>
          <button 
            onClick={() => setShowPreAuthModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Pre-authorize
          </button>
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
              ) : pendingUsers.slice((pendingCurrentPage - 1) * PAGE_SIZE, pendingCurrentPage * PAGE_SIZE).map(user => (
                <tr key={user.id || user.userid} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{user.id || user.userid || '—'}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{user.username || '—'}</td>
                  <td className="px-6 py-4 text-slate-500">{user.email}</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">{user.user_type || '—'}</span></td>
                  <td className="px-6 py-4 text-slate-500">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pending Authorization Pagination */}
        {pendingUsers.length > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between px-2">
            <p className="text-xs font-medium text-slate-500">
              Showing {(pendingCurrentPage - 1) * PAGE_SIZE + 1}–{Math.min(pendingCurrentPage * PAGE_SIZE, pendingUsers.length)} of {pendingUsers.length} requests
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPendingCurrentPage(p => Math.max(1, p - 1))}
                disabled={pendingCurrentPage === 1}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-semibold text-slate-700 min-w-[3rem] text-center">
                Page {pendingCurrentPage} of {Math.ceil(pendingUsers.length / PAGE_SIZE)}
              </span>
              <button
                onClick={() => setPendingCurrentPage(p => Math.min(Math.ceil(pendingUsers.length / PAGE_SIZE), p + 1))}
                disabled={pendingCurrentPage === Math.ceil(pendingUsers.length / PAGE_SIZE)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Modals */}
      {showPreAuthModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Pre-authorize User</h3>
              <button onClick={() => setShowPreAuthModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePreAuthorize} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Email</label>
                <input required type="email" value={preAuthEmail} onChange={(e) => setPreAuthEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm text-slate-900 font-medium" placeholder="user@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Username / Name</label>
                <input required type="text" value={preAuthName} onChange={(e) => setPreAuthName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm text-slate-900 font-medium" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Role</label>
                <select value={preAuthRole} onChange={(e) => setPreAuthRole(e.target.value as any)} 
                  disabled={isAdmin && !isSuperAdmin}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm text-slate-900 font-medium disabled:opacity-60 disabled:cursor-not-allowed">
                  <option value="USER">USER</option>
                  {isSuperAdmin && <option value="ADMIN">ADMIN</option>}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowPreAuthModal(false)} className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={actionInProgress === 'preauth'} className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg transition-colors flex justify-center items-center">
                  {actionInProgress === 'preauth' ? <span className="w-5 h-5 block animate-spin rounded-full border-2 border-white border-t-transparent"></span> : 'Pre-authorize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              {(() => {
                const isSelfEdit = !!(currentUser && (editingUser.id === currentUser.id || editingUser.userid === currentUser.id || editingUser.email === currentUser.email));
                const disableRoleDropdown = isSelfEdit || (isAdmin && !isSuperAdmin);
                return (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">User ID</label>
                      <input type="text" value={editingUser.id || editingUser.userid} disabled className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg outline-none text-sm text-slate-500 font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Username</label>
                      <input required type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm text-slate-900 font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Role</label>
                      <select value={editUserType} onChange={(e) => setEditUserType(e.target.value as any)} 
                        disabled={disableRoleDropdown}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm text-slate-900 font-medium disabled:opacity-60 disabled:cursor-not-allowed">
                        <option value="USER">USER</option>
                        {(isSuperAdmin || editUserType === 'ADMIN') && <option value="ADMIN">ADMIN</option>}
                        {editUserType === 'SUPERADMIN' && <option value="SUPERADMIN">SUPERADMIN</option>}
                      </select>
                    </div>
                  </>
                );
              })()}
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={actionInProgress?.startsWith('edit')} className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg transition-colors flex justify-center items-center">
                  {actionInProgress?.startsWith('edit') ? <span className="w-5 h-5 block animate-spin rounded-full border-2 border-white border-t-transparent"></span> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
