import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRights } from '../../contexts/UserRightsContext';
import { getPendingUsers, fetchAllUsers, activateUser, deactivateUser, preAuthorizeUser, updateUser } from '../../api/users';
import { Download, Search, Filter, Shield, Ban as BanIcon, Power, Edit, UserPlus, X, ChevronDown, ArrowUpDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserStampHistoryPanel } from '../../components/admin/UserStampHistoryPanel';
import { getTodayGMT8 } from '../../utils/dateUtils';

const PAGE_SIZE = 10;

// Helper component for disabled SuperAdmin actions
const SuperAdminDisabledActions = () => (
  <div className="relative group/tooltip flex gap-2">
    <button disabled className="px-3 py-1.5 text-outline bg-surface-container-low border border-outline-variant/30 rounded cursor-not-allowed opacity-60 flex items-center gap-1 text-xs font-semibold">
      <Edit className="w-4 h-4" /> Edit
    </button>
    <button disabled className="px-3 py-1.5 text-outline bg-surface-container-low border border-outline-variant/30 rounded cursor-not-allowed opacity-60 flex items-center gap-1 text-xs font-semibold">
      <BanIcon className="w-4 h-4" /> Deactivate
    </button>
    {/* Tooltip on Hover */}
    <div className="absolute bottom-full right-0 mb-2 hidden group-hover/tooltip:block w-48 bg-on-surface text-surface text-xs p-2 rounded shadow-lg text-center z-10 pointer-events-none">
      SUPERADMIN accounts cannot be modified
    </div>
  </div>
);

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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setActiveCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus, sortConfig]);

  if (loadingRights) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-on-surface-variant font-medium">Checking permissions...</p>
      </div>
    );
  }

  if (!hasRight('ADM_USER')) {
    return <Navigate to="/dashboard" replace />;
  }

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
    // Standardize role to uppercase for robust dropdown binding
    setEditUserType((user.user_type || 'USER').toUpperCase() as any);
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
    a.download = `User_Export_${getTodayGMT8()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 max-w-full">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-[0.05em] mb-2">Administration Console</p>
          <h2 className="text-3xl md:text-[2.75rem] font-bold text-on-surface leading-tight tracking-tight">User Management</h2>
        </div>
        <button 
          onClick={handleExportCSV}
          className="px-5 py-2.5 bg-surface-container-lowest text-on-surface font-medium rounded-lg border border-outline-variant/30 hover:bg-surface-container-low transition-colors flex items-center gap-2 shadow-sm"
        >
          <Download className="w-5 h-5" />
          Export List
        </button>
      </header>


      {/* Active Users Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h3 className="text-lg font-bold text-on-surface">Active Users</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input 
                className="pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none w-full sm:w-64 placeholder:text-outline transition-all shadow-sm" 
                placeholder="Search ID or Name" 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setFilterStatus(prev => prev === 'ALL' ? 'ACTIVE' : prev === 'ACTIVE' ? 'SUSPENDED' : 'ALL')}
              className="px-4 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm text-on-surface font-medium hover:bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap min-w-[140px]"
            >
              <div className={`w-2 h-2 rounded-full ${filterStatus === 'ACTIVE' ? 'bg-secondary' : filterStatus === 'SUSPENDED' ? 'border border-outline-variant bg-transparent' : 'bg-primary'}`}></div>
              {filterStatus === 'ALL' ? 'All Users' : filterStatus === 'ACTIVE' ? 'Active Only' : 'Suspended Only'}
            </button>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <select
                className="pl-9 pr-8 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none w-full sm:w-40 appearance-none cursor-pointer shadow-sm"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPERADMIN">SUPERADMIN</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 pointer-events-none" />
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <select
                className="pl-9 pr-8 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none w-full sm:w-48 appearance-none cursor-pointer shadow-sm"
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
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider font-bold border-b border-outline-variant/30">
                <th className="px-6 py-4 font-medium">User ID</th>
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">User Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                {hasRight('STAMP') && <th className="px-6 py-4 font-medium">Stamp</th>}
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-surface-container-low">
              {loadingActive ? (
                <tr>
                  <td colSpan={hasRight('STAMP') ? 6 : 5} className="px-6 py-8 text-center text-on-surface-variant">Loading users...</td>
                </tr>
              ) : filteredActiveUsers.length === 0 ? (
                <tr>
                  <td colSpan={hasRight('STAMP') ? 6 : 5} className="px-6 py-8 text-center text-on-surface-variant">No users match your criteria</td>
                </tr>
              ) : filteredActiveUsers.slice((activeCurrentPage - 1) * PAGE_SIZE, activeCurrentPage * PAGE_SIZE).map((user: any) => {
                const isRowSuperAdmin = user.user_type === 'SUPERADMIN';
                const isActive = user.record_status === 'ACTIVE';
                const id = user.id || user.userid;
                const isSelfRow = currentUser && (id === currentUser.id || user.email === currentUser.email);
                
                return (
                <React.Fragment key={id}>
                <tr className={`hover:bg-surface-container-low/50 transition-colors ${isRowSuperAdmin ? 'bg-surface-container-low/30' : ''}`}>
                  <td className="px-6 py-4 text-on-surface-variant font-mono text-xs">{id || '—'}</td>
                  <td className={`px-6 py-4 font-medium flex items-center gap-2 ${isRowSuperAdmin ? 'text-on-surface font-bold' : 'text-on-surface'}`}>
                    {user.username || user.email}
                    {isRowSuperAdmin && <Shield className="w-4 h-4 text-primary" />}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs justify-center rounded-full font-medium inline-flex ${isRowSuperAdmin ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      {user.user_type || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-secondary' : 'border border-outline-variant bg-transparent'}`}></div>
                      <span className={isActive ? 'text-on-surface font-bold' : 'text-on-surface-variant'}>{isActive ? 'Active' : 'Suspended'}</span>
                    </div>
                  </td>
                  {hasRight('STAMP') && (
                    <td className="px-6 py-4 text-xs text-on-surface-variant font-mono">
                      {user.stamp || '—'}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 relative group">
                      <button
                        type="button"
                        onClick={() => handleToggleExpand(id)}
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/20 rounded transition-colors"
                        title={expandedRows[id] ? "Collapse history" : "View history"}
                      >
                        {expandedRows[id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      
                      {/* SPRINT 3 GATING: Disabled Actions with Tooltip for SuperAdmins */}
                      {isRowSuperAdmin && !isSelfRow ? (
                        <SuperAdminDisabledActions />
                      ) : (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openEditModal(user)}
                            className="px-3 py-1.5 text-primary hover:bg-primary-container/20 rounded border border-transparent hover:border-primary/20 transition-all text-xs font-semibold flex items-center gap-1">
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          {isActive ? (
                            <button 
                              onClick={() => handleDeactivate(id)}
                              disabled={actionInProgress === `deactivate-${id}` || !!isSelfRow}
                              className="px-3 py-1.5 text-error hover:bg-error-container/20 rounded border border-transparent hover:border-error/20 transition-all text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed min-w-[110px]">
                              {actionInProgress === `deactivate-${id}` ? <span className="w-4 h-4 block animate-spin rounded-full border border-error border-t-transparent"></span> : <BanIcon className="w-4 h-4" />} Deactivate
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleActivate(id)}
                              disabled={actionInProgress === `activate-${id}` || !!isSelfRow}
                              className="px-3 py-1.5 text-secondary hover:bg-secondary-container/20 rounded border border-transparent hover:border-secondary/20 transition-all text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed min-w-[110px]">
                              {actionInProgress === `activate-${id}` ? <span className="w-4 h-4 block animate-spin rounded-full border border-secondary border-t-transparent"></span> : <Power className="w-4 h-4" />} Activate
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
            <p className="text-xs font-medium text-on-surface-variant">
              Showing {(activeCurrentPage - 1) * PAGE_SIZE + 1}–{Math.min(activeCurrentPage * PAGE_SIZE, filteredActiveUsers.length)} of {filteredActiveUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveCurrentPage(p => Math.max(1, p - 1))}
                disabled={activeCurrentPage === 1}
                className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-semibold text-on-surface min-w-[3rem] text-center">
                Page {activeCurrentPage} of {Math.ceil(filteredActiveUsers.length / PAGE_SIZE)}
              </span>
              <button
                onClick={() => setActiveCurrentPage(p => Math.min(Math.ceil(filteredActiveUsers.length / PAGE_SIZE), p + 1))}
                disabled={activeCurrentPage === Math.ceil(filteredActiveUsers.length / PAGE_SIZE)}
                className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
            <h3 className="text-lg font-bold text-on-surface">Pending Authorization</h3>
            <span className="px-3 py-1 bg-primary-container text-on-primary-container text-xs font-semibold rounded-full">{pendingUsers.length} Requests</span>
          </div>
          <button 
            onClick={() => setShowPreAuthModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-dim text-on-primary text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Pre-authorize
          </button>
        </div>
        
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider font-bold border-b border-outline-variant/30">
                <th className="px-6 py-4 font-medium">User ID</th>
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Requested Role</th>
                <th className="px-6 py-4 font-medium">Date Requested</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-surface-container-low">
              {loadingPending ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">Loading pending requests...</td>
                </tr>
              ) : pendingUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">No pending authorization requests</td>
                </tr>
              ) : pendingUsers.slice((pendingCurrentPage - 1) * PAGE_SIZE, pendingCurrentPage * PAGE_SIZE).map(user => (
                <tr key={user.id || user.userid} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4 text-on-surface-variant font-mono text-xs">{user.id || user.userid || '—'}</td>
                  <td className="px-6 py-4 font-bold text-on-surface">{user.username || '—'}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{user.email}</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-surface-container-high text-on-surface-variant text-xs rounded-full font-medium">{user.user_type || '—'}</span></td>
                  <td className="px-6 py-4 text-on-surface-variant">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pending Authorization Pagination */}
        {pendingUsers.length > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between px-2">
            <p className="text-xs font-medium text-on-surface-variant">
              Showing {(pendingCurrentPage - 1) * PAGE_SIZE + 1}–{Math.min(pendingCurrentPage * PAGE_SIZE, pendingUsers.length)} of {pendingUsers.length} requests
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPendingCurrentPage(p => Math.max(1, p - 1))}
                disabled={pendingCurrentPage === 1}
                className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-semibold text-on-surface min-w-[3rem] text-center">
                Page {pendingCurrentPage} of {Math.ceil(pendingUsers.length / PAGE_SIZE)}
              </span>
              <button
                onClick={() => setPendingCurrentPage(p => Math.min(Math.ceil(pendingUsers.length / PAGE_SIZE), p + 1))}
                disabled={pendingCurrentPage === Math.ceil(pendingUsers.length / PAGE_SIZE)}
                className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Modals */}
      {showPreAuthModal && (
        <div className="fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl border border-outline-variant/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
              <h3 className="text-xl font-bold text-on-surface">Pre-authorize User</h3>
              <button onClick={() => setShowPreAuthModal(false)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePreAuthorize} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1">Email</label>
                <input required type="email" value={preAuthEmail} onChange={(e) => setPreAuthEmail(e.target.value)} className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm text-on-surface font-medium" placeholder="user@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1">Username / Name</label>
                <input required type="text" value={preAuthName} onChange={(e) => setPreAuthName(e.target.value)} className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm text-on-surface font-medium" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1">Role</label>
                <select value={preAuthRole} onChange={(e) => setPreAuthRole(e.target.value as any)} 
                  disabled={isAdmin && !isSuperAdmin}
                  className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm text-on-surface font-medium disabled:opacity-60 disabled:cursor-not-allowed">
                  <option value="USER">USER</option>
                  {isSuperAdmin && <option value="ADMIN">ADMIN</option>}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowPreAuthModal(false)} className="flex-1 px-4 py-2 text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high font-medium rounded-2xl transition-colors">Cancel</button>
                <button type="submit" disabled={actionInProgress === 'preauth'} className="flex-1 px-4 py-2 text-white bg-gradient-to-br from-primary to-primary-dim font-medium rounded-2xl transition-colors flex justify-center items-center shadow-sm">
                  {actionInProgress === 'preauth' ? <span className="w-5 h-5 block animate-spin rounded-full border-2 border-white border-t-transparent"></span> : 'Pre-authorize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 bg-on-surface/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl border border-outline-variant/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
              <h3 className="text-xl font-bold text-on-surface">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-on-surface-variant hover:text-on-surface transition-colors">
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
                      <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1">User ID</label>
                      <input type="text" value={editingUser.id || editingUser.userid} disabled className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg outline-none text-sm text-on-surface-variant font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1">Username</label>
                      <input required type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm text-on-surface font-medium" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1">Role</label>
                      <select value={editUserType} onChange={(e) => setEditUserType(e.target.value as any)} 
                        disabled={disableRoleDropdown}
                        className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm text-on-surface font-medium disabled:opacity-60 disabled:cursor-not-allowed">
                        <option value="USER">USER</option>
                        {(isSuperAdmin || editUserType === 'ADMIN') && <option value="ADMIN">ADMIN</option>}
                        {(isSuperAdmin || editUserType === 'SUPERADMIN') && <option value="SUPERADMIN">SUPERADMIN</option>}
                      </select>
                    </div>
                  </>
                );
              })()}
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2 text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high font-medium rounded-2xl transition-colors">Cancel</button>
                <button type="submit" disabled={actionInProgress?.startsWith('edit')} className="flex-1 px-4 py-2 text-white bg-gradient-to-br from-primary to-primary-dim font-medium rounded-2xl transition-colors flex justify-center items-center shadow-sm">
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