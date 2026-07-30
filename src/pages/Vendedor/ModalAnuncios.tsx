import React from 'react';
import { X, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModalAnunciosProps {
    isOpen: boolean;
    onClose: () => void;
    advertisements: any[];
    vendedorNome: string;
}

const ModalAnuncios: React.FC<ModalAnunciosProps> = ({ isOpen, onClose, advertisements, vendedorNome }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c0c12] border-2 border-purple-500/30 rounded-[32px] shadow-[0_0_50px_rgba(147,51,234,0.15)] flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-white/5 relative z-10 bg-[#0c0c12]">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Anúncios Ativos</h2>
                        <p className="text-sm text-white/50 font-medium mt-1">Todos os anúncios de {vendedorNome}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 relative z-10 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {advertisements.map((ad: any) => {
                            const adLocation = ad.address ? `${ad.address.cityName}` : 'Localização não informada';
                            const imageUrl = ad.pictures?.[0]?.url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=300';
                            
                            return (
                                <div
                                    key={ad.id}
                                    onClick={() => {
                                        onClose();
                                        navigate(`/produto/${ad.id}`);
                                    }}
                                    className="bg-white/5 rounded-2xl overflow-hidden border border-white/5 flex transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:bg-white/10 cursor-pointer flex-col h-full"
                                >
                                    <img src={imageUrl} alt={ad.title} className="w-full h-32 object-cover shrink-0" />
                                    <div className="p-4 flex flex-col justify-between flex-1 gap-2">
                                        <h4 className="text-sm font-bold text-white mb-1 line-clamp-2">{ad.title}</h4>
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
                </div>
            </div>
        </div>
    );
};

export default ModalAnuncios;
