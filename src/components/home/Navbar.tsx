import React from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import BrandLogo from './Logo';
import BotaoGenerico from '../BotaoGenerico';
import UserAvatar from '../UserAvatar';
import BarraPesquisa from './BarraPesquisa';
import { getAuthSession } from '../../lib/session';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchValue = searchParams.get('q') ?? '';

  const session = getAuthSession();
  const user = session?.user;

  const handleAnunciar = () => {
    if (user) {
      navigate('/anunciar');
    } else {
      navigate('/login', { state: { from: '/anunciar' } });
    }
  };

  const updateSearchParam = (nextValue: string) => {
    const nextParams = new URLSearchParams(searchParams);
    const trimmed = nextValue.trim();

    if (trimmed) {
      nextParams.set('q', nextValue);
    } else {
      nextParams.delete('q');
    }

    setSearchParams(nextParams, { replace: true });
  };

  const handleSearchChange = (value: string) => {
    updateSearchParam(value);
  };

  const handleSearchSubmit = () => {
    if (location.pathname === '/') {
      return;
    }

    const nextParams = new URLSearchParams();
    const trimmed = searchValue.trim();

    if (trimmed) {
      nextParams.set('q', trimmed);
    }

    navigate({ pathname: '/', search: nextParams.toString() });
  };

  return (
    <nav className="w-full h-20 
                    bg-[#0a0a1a]/95 backdrop-blur-xl
                    px-10 
                    border-b border-liquid-purple/15
                    sticky top-0 z-100 
                    flex items-center justify-between
                    shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

      <div className="shrink-0">
        <BrandLogo cidade="Cedro" />
      </div>

      <div className="flex-1 flex justify-center max-w-2xl px-8">
        <BarraPesquisa
          value={searchValue}
          onChange={handleSearchChange}
          onSubmit={handleSearchSubmit}
        />
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <BotaoGenerico onClick={handleAnunciar}>
          Anunciar agora
        </BotaoGenerico>

        {!user && (
          <BotaoGenerico onClick={() => navigate('/login')}>
            Entrar
          </BotaoGenerico>
        )}

        {user && <UserAvatar />}
      </div>
    </nav>
  );
};

export default Navbar;