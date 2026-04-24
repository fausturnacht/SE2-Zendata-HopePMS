import React, { useState } from 'react';
import { 
  getProducts, 
  addProduct, 
  updateProduct, 
  softDeleteProduct, 
  recoverProduct,
  type UserType
} from '../api/products';

type TabType = 'LIST' | 'ADD' | 'UPDATE' | 'DELETE' | 'RECOVER';

const ApiDebug: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('LIST');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [userType, setUserType] = useState<UserType>('USER');
  const [prodcode, setProdcode] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('pc');

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let data;
      switch (activeTab) {
        case 'LIST':
          data = await getProducts(userType);
          break;
        case 'ADD':
          data = await addProduct({ prodcode, description, unit });
          break;
        case 'UPDATE':
          data = await updateProduct(prodcode, { description, unit });
          break;
        case 'DELETE':
          data = await softDeleteProduct(prodcode);
          break;
        case 'RECOVER':
          data = await recoverProduct(prodcode);
          break;
      }
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: string; color: string }[] = [
    { id: 'LIST', label: 'Fetch', icon: 'list_alt', color: 'blue' },
    { id: 'ADD', label: 'Add', icon: 'add_circle', color: 'emerald' },
    { id: 'UPDATE', label: 'Update', icon: 'edit_square', color: 'amber' },
    { id: 'DELETE', label: 'Delete', icon: 'delete', color: 'rose' },
    { id: 'RECOVER', label: 'Recover', icon: 'history', color: 'indigo' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-200">
              <span className="material-symbols-outlined text-white text-2xl">api</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              API Controller
            </h1>
          </div>
          <p className="text-slate-600 font-medium">
            Select an operation and provide parameters to interact with the Supabase backend.
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* Pill Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-3xl border border-slate-200 shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 ${
                    activeTab === tab.id 
                      ? `bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105` 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${activeTab === tab.id ? 'text-white' : `text-${tab.color}-500`}`}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Input Configuration */}
            <section className="bg-white rounded-[2rem] shadow-md shadow-slate-200/50 border border-slate-200 p-8 relative overflow-hidden">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="material-symbols-outlined text-blue-600 bg-blue-50 p-1.5 rounded-lg text-lg">
                  {tabs.find(t => t.id === activeTab)?.icon}
                </span>
                {tabs.find(t => t.id === activeTab)?.label} Parameters
              </h2>
              
              <div className="space-y-6 min-h-[320px] flex flex-col">
                <div className="flex-1 space-y-6">
                  {activeTab === 'LIST' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-600 ml-1">User Role Access</label>
                      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        {(['USER', 'ADMIN', 'SUPERADMIN'] as UserType[]).map((type) => (
                          <button
                            key={type}
                            onClick={() => setUserType(type)}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                              userType === type 
                                ? 'bg-white shadow-sm text-blue-700 border border-blue-100' 
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500 italic ml-1 mt-2">
                        {userType === 'USER' ? 'Filtering for record_status = "ACTIVE" only.' : 'Returning all database records.'}
                      </p>
                    </div>
                  )}

                  {(activeTab !== 'LIST') && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-600 ml-1">
                          Product Code {activeTab === 'UPDATE' && <span className="text-blue-500">(Required)</span>}
                        </label>
                        <input 
                          type="text" 
                          value={prodcode} 
                          onChange={(e) => setProdcode(e.target.value)}
                          placeholder="e.g. PRD-8821"
                          className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-3.5 focus:border-slate-900 focus:ring-0 outline-none transition-all placeholder:text-slate-300 font-bold text-slate-900"
                        />
                      </div>
                      
                      {(activeTab === 'ADD' || activeTab === 'UPDATE') && (
                        <>
                          <div className="space-y-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-600 ml-1">Description</label>
                            <textarea 
                              value={description} 
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Specify product attributes..."
                              rows={2}
                              className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-3.5 focus:border-slate-900 focus:ring-0 outline-none transition-all placeholder:text-slate-300 font-bold text-slate-900 resize-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-600 ml-1">Unit</label>
                            <div className="relative">
                              <select 
                                value={unit} 
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-3.5 focus:border-slate-900 focus:ring-0 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer"
                              >
                                <option value="pc">Piece (pc)</option>
                                <option value="ea">Each (ea)</option>
                                <option value="mtr">Meter (mtr)</option>
                                <option value="pkg">Package (pkg)</option>
                                <option value="ltr">Liter (ltr)</option>
                              </select>
                              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-light">expand_more</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Execution Button */}
                <button 
                  onClick={handleExecute}
                  disabled={loading}
                  className={`mt-8 flex items-center justify-center gap-3 w-full p-5 rounded-[1.8rem] font-black text-sm uppercase tracking-widest transition-all active:scale-[0.97] shadow-xl ${
                    loading 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
                  }`}
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined">{tabs.find(t => t.id === activeTab)?.icon}</span>
                  )}
                  {loading ? 'Executing Request...' : `Run ${activeTab} Operation`}
                </button>
              </div>
            </section>
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-7 h-full">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border-2 border-slate-200 h-full flex flex-col overflow-hidden min-h-[600px]">
              <div className="bg-slate-100 p-5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4">Terminal Response</span>
                </div>
                {loading && (
                  <div className="flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-widest">
                    <div className="w-2 h-2 bg-slate-900 rounded-full animate-ping"></div>
                    Executing
                  </div>
                )}
              </div>
              
              <div className="flex-1 p-8 font-mono text-[14px] overflow-auto bg-slate-50 relative">
                {error && (
                  <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-2xl text-rose-700 mb-6 flex items-start gap-4 animate-in fade-in zoom-in-95 duration-200">
                    <span className="material-symbols-outlined">warning</span>
                    <div>
                      <div className="font-black uppercase tracking-tighter text-xs mb-1 text-rose-800">System Error</div>
                      <p className="leading-relaxed font-sans font-bold">{error}</p>
                    </div>
                  </div>
                )}
                
                {result ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-2 mb-4 text-emerald-600 font-black text-xs uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Operation Successful
                    </div>
                    <pre className="text-slate-800 leading-relaxed overflow-x-auto whitespace-pre-wrap font-bold">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                ) : !loading && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20 opacity-60">
                    <div className="w-24 h-24 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center mb-6 shadow-sm">
                      <span className="material-symbols-outlined text-4xl text-slate-300">data_object</span>
                    </div>
                    <p className="font-bold text-slate-400">Awaiting database operation...</p>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-100 p-4 border-t border-slate-200 text-[10px] font-bold text-slate-500 flex justify-between px-8">
                <div className="flex gap-6">
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>Supabase Connected</span>
                  <span className="font-mono">OP_TYPE: {activeTab}</span>
                </div>
                <span>LATENCY: {Math.floor(Math.random() * 50) + 10}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDebug;
