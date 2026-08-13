import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Bell, AlertTriangle, Users, Box, Settings, 
  LogOut, Flag, Shield, Trash2, Ban, ListOrdered 
} from 'lucide-react';
import { clearAuthSession, getAuthSession } from '../../lib/session';
import { trpc } from '../../lib/trpc';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const session = getAuthSession();
  const user = session?.user;

  const [activeTab, setActiveTab] = useState<'denuncias' | 'usuarios'>('denuncias');
  const [filter, setFilter] = useState<"ALL" | "FRAUD" | "PROHIBITED" | "OFFENSIVE">("ALL");

  const { data: stats, refetch: refetchStats } = trpc.admin.getStats.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const { data: complaints, refetch: refetchComplaints } = trpc.admin.listComplaints.useQuery({ filter }, {
    refetchInterval: 10000,
  });

  const removeAdMutation = trpc.admin.removeAd.useMutation({
    onSuccess: () => { refetchComplaints(); refetchStats(); },
  });

  const banUserMutation = trpc.admin.banUser.useMutation({
    onSuccess: () => { refetchComplaints(); refetchStats(); },
  });

  const ignoreComplaintMutation = trpc.admin.ignoreComplaint.useMutation({
    onSuccess: () => { refetchComplaints(); refetchStats(); },
  });

  const { data: usersData, refetch: refetchUsers } = trpc.admin.listUsers.useQuery(undefined, {
    enabled: activeTab === 'usuarios',
  });

  const toggleUserStatusMutation = trpc.admin.toggleUserStatus.useMutation({
    onSuccess: () => refetchUsers(),
  });

  if (user?.role !== 'Admin') {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    clearAuthSession();
    navigate('/');
  };

  const handleRemove = (id: number) => {
    if (confirm("Tem certeza que deseja remover este anúncio?")) {
      removeAdMutation.mutate({ id });
    }
  };

  const handleBan = (id: number) => {
    if (confirm("Tem certeza que deseja banir este usuário?")) {
      banUserMutation.mutate({ id });
    }
  };

  const handleIgnore = (id: number) => {
    if (confirm("Tem certeza que deseja ignorar (e excluir) esta denúncia?")) {
      ignoreComplaintMutation.mutate({ id });
    }
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    toggleUserStatusMutation.mutate({ id, status: currentStatus === 'Active' ? 'Blocked' : 'Active' });
  };

  return (
    <div className="min-h-screen bg-[#0d0a1a] flex font-sans text-white overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0b0914] border-r border-white/5 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-20 relative">
        <div>
          {/* Logo Area */}
          <div className="p-6 pb-8 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight">Desapega<span className="text-[#a855f7]">Ê</span></h1>
                <span className="bg-[#241a4a] text-[#a855f7] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#a855f7]/30">CEDRO</span>
              </div>
              <p className="text-xs text-white/60 font-bold uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>

          {/* Menus */}
          <div className="p-6">
            <h3 className="text-white/40 text-xs font-black uppercase tracking-widest mb-4">Gestão Principal</h3>
            
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab('denuncias')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'denuncias' 
                  ? 'bg-[#2a1b4d]/40 border border-[#a855f7]/40 text-white/90' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <AlertTriangle size={18} className={activeTab === 'denuncias' ? "text-[#a855f7]" : ""} />
                <span className={`font-bold text-sm ${activeTab === 'denuncias' ? "text-[#a855f7]" : ""}`}>Denúncias</span>
              </button>

              <button 
                onClick={() => setActiveTab('usuarios')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'usuarios' 
                  ? 'bg-[#1b2a4d]/40 border border-blue-500/40 text-white/90' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users size={18} className={activeTab === 'usuarios' ? "text-blue-400" : ""} />
                <span className={`font-bold text-sm ${activeTab === 'usuarios' ? "text-blue-400" : ""}`}>Usuários</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="p-6 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full text-red-500 hover:text-red-400 px-4 py-3 rounded-xl transition-all">
            <LogOut size={18} />
            <span className="font-bold text-sm">Sair do sistema</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-gradient-to-br from-[#0d0a1a] to-[#1a113a] relative">
        
        {/* Glow Effects no background */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

        {/* TOPBAR */}
        <header className="h-20 border-b border-white/5 px-10 flex items-center justify-between sticky top-0 bg-[#0d0a1a]/80 backdrop-blur-md z-10">
          <div className="w-full max-w-md relative">
            <input 
              type="text" 
              placeholder="Buscar usuário, ID de denúncia"
              className="w-full bg-[#17142b] border border-white/10 text-white text-sm rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-[#a855f7]/50 transition-colors"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-white/60 hover:text-white transition-colors cursor-default">
              <Bell size={24} />
              {stats?.pendingComplaints && stats.pendingComplaints > 0 ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center border border-[#0d0a1a]">
                  {stats.pendingComplaints}
                </span>
              ) : null}
            </button>

            <div className="h-8 w-[1px] bg-white/10" />

            <div className="flex items-center gap-3 hover:bg-white/5 p-1.5 pr-4 rounded-full transition-colors">
              <div className="text-right">
                <p className="text-sm font-bold leading-tight">{user?.name || 'Admin Silva'}</p>
                <p className="text-xs text-white/50 font-medium">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-cyan-200 flex items-center justify-center text-cyan-800 font-black shadow-inner">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AS'}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="p-10 flex-1 relative z-10">
          
          <div className="mb-10">
            <h2 className="text-3xl font-black mb-1">
              {activeTab === 'denuncias' ? 'Central de Moderação' : 'Gestão de Usuários'}
            </h2>
            <p className="text-white/60 font-medium">
              {activeTab === 'denuncias' 
                ? 'Gerencie denúncias, remova anúncios impróprios e aplique punições a usuários.' 
                : 'Visualize e gerencie todos os usuários cadastrados na plataforma.'}
            </p>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Card 1 */}
            <div className="bg-[#241a2e] border border-red-500/30 rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden shadow-lg shadow-red-900/10 hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30 z-10">
                <Flag className="text-red-400" size={28} />
              </div>
              <div className="z-10">
                <p className="text-sm font-bold text-white/60 mb-0.5">Denúncias Pendentes</p>
                <p className="text-3xl font-black">{stats?.pendingComplaints || 0}</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#191d36] border border-blue-500/30 rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden shadow-lg shadow-blue-900/10 hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 z-10">
                <Box className="text-blue-400" size={28} />
              </div>
              <div className="z-10">
                <p className="text-sm font-bold text-white/60 mb-0.5">Anúncios Ativos</p>
                <p className="text-3xl font-black">{stats?.activeAds || 0}</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#1a2d24] border border-green-500/30 rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden shadow-lg shadow-green-900/10 hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30 z-10">
                <Users className="text-green-400" size={28} />
              </div>
              <div className="z-10">
                <p className="text-sm font-bold text-white/60 mb-0.5">Usuários Registrados</p>
                <p className="text-3xl font-black">{stats?.registeredUsers || 0}</p>
              </div>
            </div>
          </div>

          {/* TAB CONTENT */}
          {activeTab === 'denuncias' ? (
            <div className="bg-[#1b1928] border border-white/10 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            {/* Table Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ListOrdered className="text-cyan-400" size={24} />
                <h3 className="text-2xl font-black">Fila de Moderação</h3>
              </div>
              
              <div className="relative">
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="appearance-none bg-[#2a263b] border border-white/10 text-white text-sm font-bold rounded-xl py-2 pl-4 pr-10 focus:outline-none focus:border-[#a855f7]/50 cursor-pointer transition-colors"
                >
                  <option value="ALL">Todas as denúncias</option>
                  <option value="FRAUD">Fraude</option>
                  <option value="PROHIBITED">Item Proibido</option>
                  <option value="OFFENSIVE">Linguagem Ofensiva</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#242133] border-b border-white/5">
                    <th className="px-6 py-4 text-sm font-bold text-white/70">ID / Data</th>
                    <th className="px-6 py-4 text-sm font-bold text-white/70">Alvo da Denúncia</th>
                    <th className="px-6 py-4 text-sm font-bold text-white/70">Motivo</th>
                    <th className="px-6 py-4 text-sm font-bold text-white/70">Ações de Moderação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  
                  {complaints?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-white/50 font-bold">
                        Nenhuma denúncia pendente encontrada.
                      </td>
                    </tr>
                  )}

                  {complaints?.map((c) => {
                    const isAd = c.alvoTipo === 'Anuncio';
                    
                    return (
                      <tr key={c.id} className={`hover:bg-white/[0.02] transition-colors group ${c.seen ? 'opacity-40' : ''}`}>
                        <td className="px-6 py-5">
                          <p className="text-xs font-bold text-white/40 mb-1">#DEN-{c.id.toString().padStart(4, '0')}</p>
                          <p className="text-sm font-black text-white/90">
                            {new Date(c.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })},{' '}
                            {new Date(c.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            {isAd ? (
                              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                <img src={c.alvoImagem || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=100'} alt="Ad" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-black border border-green-500/30 shrink-0 shadow-inner overflow-hidden">
                                {c.alvoImagem ? (
                                  <img src={c.alvoImagem} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                  c.alvoNome.substring(0, 2).toUpperCase()
                                )}
                              </div>
                            )}
                            
                            <div>
                              <p className="font-bold text-sm text-white/90">{c.alvoNome} ({c.alvoTipo})</p>
                              <a 
                                href={isAd ? `/produto/${c.alvoId}` : `/vendedor/${c.alvoId}`} 
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[#a855f7] hover:text-[#c084fc] transition-colors font-bold"
                              >
                                Ver {isAd ? 'Anúncio' : 'Perfil'} Original
                              </a>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-5">
                          <div className="flex flex-col items-start gap-1">
                            <span className="inline-block px-2 py-1 rounded bg-[#a855f7]/20 text-[#a855f7] text-[10px] font-black border border-[#a855f7]/30">
                              {c.category === 'FRAUD' ? 'Fraude' : 
                               c.category === 'PROHIBITED' ? 'Proibido' : 
                               c.category === 'SPAM' ? 'Spam' :
                               c.category === 'OFFENSIVE' ? 'Ofensivo' :
                               c.category === 'SCAM' ? 'Golpe' :
                               c.category === 'FAKE_PROFILE' ? 'Perfil Falso' : 'Outro'}
                            </span>
                            <span className="text-xs font-medium text-white/80">
                              {c.reason.length > 30 ? c.reason.substring(0, 30) + '...' : c.reason}
                            </span>
                          </div>
                          <p className="text-[10px] text-white/40 font-bold max-w-[200px] mt-1.5">
                            Por: {c.denuncianteNome}
                          </p>
                        </td>
                        
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleRemove(c.id)}
                              disabled={!isAd || c.seen}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-black transition-all
                                ${!isAd || c.seen ? 'border-white/5 text-white/20 cursor-not-allowed' : 'border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50'}`}
                            >
                              <Trash2 size={14} /> Remover Ad
                            </button>
                            <button 
                              onClick={() => handleBan(c.id)}
                              disabled={c.seen}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-black transition-all
                                ${c.seen ? 'border-white/5 text-white/20 cursor-not-allowed' : 'border-white/20 text-white/90 hover:bg-white/10 hover:border-white/40'}`}
                            >
                              <Ban size={14} /> Banir
                            </button>
                            <button 
                              onClick={() => handleIgnore(c.id)}
                              disabled={c.seen}
                              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-colors shadow-lg
                                ${c.seen ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}
                            >
                              Ignorar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          ) : (
          <div className="bg-[#191e36] border border-blue-500/20 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="text-blue-400" size={24} />
                <h3 className="text-2xl font-black">Lista de Usuários</h3>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1c223a] border-b border-white/5">
                    <th className="px-6 py-4 text-sm font-bold text-white/70">ID / Data Cadastro</th>
                    <th className="px-6 py-4 text-sm font-bold text-white/70">Usuário</th>
                    <th className="px-6 py-4 text-sm font-bold text-white/70">Status / Papel</th>
                    <th className="px-6 py-4 text-sm font-bold text-white/70">Métricas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usersData?.map((u) => (
                    <tr 
                      key={u.id} 
                      onClick={() => window.open(`/vendedor/${u.id}`, '_blank')}
                      className="hover:bg-white/[0.05] transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-white/40 mb-1">#USR-{u.id.toString().padStart(4, '0')}</p>
                        <p className="text-sm font-black text-white/90">
                          {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </td>
                      
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-black border border-blue-500/30 shrink-0 shadow-inner overflow-hidden">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white/90">{u.name}</p>
                            <p className="text-xs text-white/50">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-5">
                        <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-black mb-1.5 border ${
                          u.status === 'Active' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {u.status === 'Active' ? 'ATIVO' : 'BLOQUEADO'}
                        </span>
                        <p className="text-xs text-white/50 font-bold uppercase">
                          Papel: {u.role === 'Admin' ? 'Administrador' : u.role === 'Advertiser' ? 'Anunciante' : 'Visitante'}
                        </p>
                      </td>
                      
                      <td className="px-6 py-5">
                        <p className="text-xs text-white/70 font-medium mb-1">Anúncios: <span className="text-white font-bold">{u.adsCount}</span></p>
                        <p className="text-xs text-white/70 font-medium">Denúncias (Alvo): <span className="text-white font-bold">{u.complaintsCount}</span></p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}

        </div>

      </main>

    </div>
  );
};

export default AdminPanel;
