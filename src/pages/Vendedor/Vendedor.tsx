import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle2, MapPin, Star, ShoppingBag,
    Phone, Calendar, MessageCircle, Flag, Tag
} from 'lucide-react';
import { trpc } from '../../lib/trpc';
import ModalAvaliacao from './ModalAvaliacao';
import ModalAnuncios from './ModalAnuncios';
import ReportModal from '../../components/ReportModal';

const Vendedor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdsModalOpen, setIsAdsModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reviewsVisibleCount, setReviewsVisibleCount] = useState(3);

    const vendedorId = Number(id);
    const hasValidId = Number.isInteger(vendedorId) && vendedorId > 0;

    const { data: vendedor, isLoading, error } = trpc.user.getVendedor.useQuery(
        { id: vendedorId },
        { enabled: hasValidId }
    );

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center py-12">
                <p className="font-bold text-white/50">Carregando...</p>
            </div>
        );
    }

    if (error || !vendedor) {
        return (
            <div className="w-full flex items-center justify-center py-12">
                <p className="font-bold text-red-400">Erro ao carregar vendedor ou vendedor não encontrado.</p>
            </div>
        );
    }

    const locationString = vendedor.address ? `${vendedor.address.cityName}${vendedor.address.neighborhood ? `, ${vendedor.address.neighborhood}` : ''}` : 'Localização indisponível';
    const createdAtString = new Date(vendedor.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const reviewCount = vendedor.reviews.length;
    const rating = reviewCount > 0 ? vendedor.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewCount : 0;
    const isVerified = vendedor.status === 'Active';

    const handleWhatsAppClick = () => {
        if (!vendedor.phone) return;
        
        // Extract only digits
        const numericPhone = vendedor.phone.replace(/\D/g, '');
        if (!numericPhone) return;
        
        // Assuming brazilian number, prepend 55 if not there
        let whatsappNumber = numericPhone;
        if (!whatsappNumber.startsWith('55') && whatsappNumber.length >= 10) {
            whatsappNumber = `55${whatsappNumber}`;
        }
        
        const message = encodeURIComponent(`Olá ${vendedor.name}, vi o seu perfil no DesapegaE!`);
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    };

    const sortedReviews = [...vendedor.reviews].sort((a: any, b: any) => {
        if (b.rating !== a.rating) {
            return b.rating - a.rating; // Highest rating first
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // Oldest first (da mais velha para a mais nova)
    });

    const visibleAds = vendedor.advertisements.slice(0, 3);
    const visibleReviews = sortedReviews.slice(0, reviewsVisibleCount);

    return (
        <div className="w-full pb-16 text-white relative">

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

                {/* Botão Voltar */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white/50 hover:text-white font-medium text-sm mb-6 transition-colors"
                >
                    <ArrowLeft size={16} /> Voltar
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">

                    {/* ================= CARD DO VENDEDOR ================= */}
                    <aside className="lg:col-span-1">
                        <div className="bg-[#0c0c12]/60 backdrop-blur-md border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.3)] rounded-[32px] p-8 text-center sticky top-28">

                            {/* Selo de Verificado */}
                            {isVerified && (
                                <div className="absolute top-6 right-6 bg-green-500/10 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-500/20">
                                    <CheckCircle2 size={14} /> Verificado
                                </div>
                            )}

                            {/* Avatar e Nome */}
                            <div className="relative w-28 h-28 mx-auto mb-4">
                                <img
                                    src={vendedor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendedor.name)}&background=9333EA&color=fff&size=150`}
                                    alt={vendedor.name}
                                    className="w-full h-full rounded-full object-cover border-4 border-[#050508] shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                                />
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-[#050508] rounded-full" title="Online agora"></div>
                            </div>

                            <h2 className="text-2xl font-black text-white mb-1">{vendedor.name}</h2>
                            <p className="text-sm text-white/50 mb-6 flex items-center justify-center gap-1.5 font-medium">
                                <MapPin size={14} className="text-purple-400" /> {locationString}
                            </p>

                            {/* Avaliação Principal - CLICÁVEL */}
                            <div
                                onClick={() => setIsModalOpen(true)}
                                className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/5 cursor-pointer hover:bg-white/10 hover:border-purple-500/30 transition-all group"
                            >
                                <div className="text-3xl font-black text-white mb-1 group-hover:text-yellow-400 transition-colors">
                                    {rating.toFixed(1)}
                                </div>
                                <div className="flex justify-center text-yellow-400 text-sm mb-2 gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < Math.floor(rating) ? "currentColor" : "none"} strokeWidth={i < Math.floor(rating) ? 0 : 2} />
                                    ))}
                                </div>
                                <p className="text-xs text-white/40 font-medium mb-1">Baseado em {reviewCount} avaliações</p>
                                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest opacity-0 h-0 group-hover:opacity-100 group-hover:h-auto transition-all mt-2">
                                    Clique para avaliar
                                </p>
                            </div>

                            {/* Métricas do Vendedor */}
                            <div className="grid grid-cols-2 gap-4 text-left mb-8">
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <div className="text-white/40 text-[10px] font-bold mb-1 uppercase tracking-wider">Vendas</div>
                                    <div className="text-white font-black flex items-center gap-2">
                                        <ShoppingBag size={14} className="text-purple-400" /> {vendedor.salesCount}
                                    </div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <div className="text-white/40 text-[10px] font-bold mb-1 uppercase tracking-wider">Contato</div>
                                    <div className="text-white font-black flex items-center gap-2">
                                        <Phone size={14} className="text-blue-400" /> {vendedor.phone || 'Não informado'}
                                    </div>
                                </div>
                                <div className="col-span-2 bg-white/5 rounded-xl p-3 border border-white/5">
                                    <div className="text-white/40 text-[10px] font-bold mb-1 uppercase tracking-wider">Na plataforma desde</div>
                                    <div className="text-white font-black flex items-center gap-2">
                                        <Calendar size={14} className="text-purple-400" /> {createdAtString}
                                    </div>
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <button
                                onClick={handleWhatsAppClick}
                                disabled={!vendedor.phone}
                                className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white font-bold py-3.5 rounded-xl hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
                            >
                                <MessageCircle size={18} /> Enviar Mensagem
                            </button>
                            <button 
                                onClick={() => setIsReportModalOpen(true)}
                                className="w-full text-white/30 text-xs font-bold hover:text-white/60 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Flag size={12} /> Denunciar perfil
                            </button>

                        </div>
                    </aside>

                    {/* ================= CONTEÚDO PRINCIPAL ================= */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* SEÇÃO: ANÚNCIOS ATIVOS */}
                        <section className="bg-[#0c0c12]/60 backdrop-blur-md border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.3)] rounded-[32px] p-8">
                            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-5">
                                <h3 className="text-xl font-black text-white flex items-center gap-2">
                                    <Tag className="text-purple-400" size={20} /> Anúncios Ativos ({vendedor.advertisements.length})
                                </h3>
                                {vendedor.advertisements.length > 3 && (
                                    <button 
                                        onClick={() => setIsAdsModalOpen(true)}
                                        className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors"
                                    >
                                        Ver todos
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {visibleAds.map((ad: any) => {
                                    const adLocation = ad.address ? `${ad.address.cityName}` : locationString.split(',')[0];
                                    const imageUrl = ad.pictures?.[0]?.url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=300';
                                    
                                    return (
                                        <div
                                            key={ad.id}
                                            onClick={() => navigate(`/produto/${ad.id}`)}
                                            className="bg-white/5 rounded-2xl overflow-hidden border border-white/5 flex transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:bg-white/10 cursor-pointer flex-col h-full"
                                        >
                                            <img src={imageUrl} alt={ad.title} className="w-full h-28 object-cover shrink-0" />
                                            <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                                                <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">{ad.title}</h4>
                                                <div className="mt-auto">
                                                    <span className="text-white font-black text-sm">
                                                        {(ad.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </span>
                                                    <span className="text-xs text-white/40 mt-1 flex items-center gap-1 font-medium truncate">
                                                        <MapPin size={10} /> {adLocation}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* SEÇÃO: AVALIAÇÕES E COMENTÁRIOS */}
                        <section className="bg-[#0c0c12]/60 backdrop-blur-md border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.3)] rounded-[32px] p-8">

                            {/* CABEÇALHO DA SEÇÃO COM O NOVO BOTÃO */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 border-b border-white/5 pb-5 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-500/10 text-yellow-400 rounded-xl flex items-center justify-center text-lg border border-yellow-500/20 shrink-0">
                                        <MessageCircle size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-white">O que dizem os compradores</h3>
                                </div>

                                {!vendedor.isOwnProfile && !vendedor.hasReviewed && (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="flex items-center justify-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(234,179,8,0.2)] shrink-0"
                                    >
                                        <Star size={16} className="fill-yellow-400" />
                                        Avaliar Vendedor
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {sortedReviews.length === 0 ? (
                                    <p className="text-sm text-white/50 text-center py-4">Este vendedor ainda não possui avaliações.</p>
                                ) : (
                                    visibleReviews.map((review: any) => (
                                        <div key={review.id} className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={review.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.name)}&background=1E1B4B&color=A855F7`} alt={review.user.name} className="w-10 h-10 rounded-full border border-white/10" />
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white">{review.user.name}</h4>
                                                        <p className="text-xs text-white/40 font-medium">Comprou: {review.advertisement.title}</p>
                                                    </div>
                                                </div>
                                                <div className="flex text-yellow-400 gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-white/70 leading-relaxed italic">"{review.comment}"</p>
                                            <span className="text-[11px] text-white/30 mt-3 block font-bold uppercase tracking-wider">
                                                {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {sortedReviews.length > reviewsVisibleCount && (
                                <button 
                                    onClick={() => setReviewsVisibleCount(prev => prev + 5)}
                                    className="w-full mt-6 py-4 rounded-xl border-2 border-white/10 text-white font-bold hover:bg-white/5 transition-colors uppercase tracking-wider text-sm"
                                >
                                    Carregar mais avaliações
                                </button>
                            )}
                        </section>

                    </div>
                </div>
            </main>

            {/* COMPONENTE DO MODAL AQUI */}
            <ModalAvaliacao
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                vendedorId={vendedor.id}
                vendedorNome={vendedor.name}
            />

            <ModalAnuncios 
                isOpen={isAdsModalOpen}
                onClose={() => setIsAdsModalOpen(false)}
                advertisements={vendedor.advertisements}
                vendedorNome={vendedor.name}
            />

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                targetId={vendedor.id}
                type="USER"
            />
        </div>
    );
};

export default Vendedor;