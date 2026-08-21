import React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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

    navigate({
      pathname: '/',
      search: nextParams.toString(),
    });
  };

  return (
    <nav
      className="
        w-full
        bg-[#0a0a1a]/95
        backdrop-blur-xl
        border-b border-liquid-purple/15
        sticky top-0 z-[100]
        shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        px-4 sm:px-6 lg:px-10
        py-3 lg:py-0
      "
    >
      <div
        className="
          min-h-20
          flex flex-wrap
          items-center
          justify-between
          gap-y-3
          lg:flex-nowrap
        "
      >
        {/* LOGO */}
        <div className="shrink-0">
          <Link
            to="/"
            className="block hover:opacity-80 transition-opacity"
          >
            <BrandLogo cidade="Cedro" />
          </Link>
        </div>

        {/* BARRA DE PESQUISA */}
        <div
          className="
            order-3
            basis-full
            lg:order-2
            lg:basis-auto
            lg:flex-1
            lg:px-8
            flex
            justify-center
          "
        >
          <div className="w-full max-w-2xl">
            <BarraPesquisa
              value={searchValue}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
            />
          </div>
        </div>

        {/* AÇÕES */}
        <div
          className="
            order-2
            flex
            items-center
            gap-2 sm:gap-4
            shrink-0
            lg:order-3
          "
        >
          <BotaoGenerico onClick={handleAnunciar}>
            <span className="hidden sm:inline">
              Anunciar agora
            </span>

            <span className="sm:hidden">
              Anunciar
            </span>
          </BotaoGenerico>

          {!user && (
            <BotaoGenerico onClick={() => navigate('/login')}>
              Entrar
            </BotaoGenerico>
          )}

          {user && <UserAvatar />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;