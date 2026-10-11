import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();

  const navItems = [
    { label: t('stateView'), path: '/state' },
    { label: t('national'), path: '/national' },
    { label: t('districtView'), path: '/district' },
    { label: t('tradeDetail'), path: '/trade' },
    { label: t('rankingBoard'), path: '/ranking' },
    { label: t('whatIf'), path: '/whatif' },
    { label: t('alerts'), path: '/alerts' },
    { label: t('methodology'), path: '/methodology' }
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-black flex flex-col justify-between p-6 flex-shrink-0">
      <div>
        {/* App Title */}
        <div className="mb-8">
          <h2 className="text-lg font-black tracking-tighter text-black uppercase leading-tight font-sans">
            SKILLGAP<br />INTELLIGENCE
          </h2>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1 block">
            MSDE · SIH 2026
          </span>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'block text-sm font-semibold tracking-tight transition-colors py-2 px-3',
                  isActive
                    ? 'bg-black text-white'
                    : 'text-slate-700 hover:text-black hover:bg-slate-100'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Language Toggle matching Ink Mono mockup */}
      <div>
        <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => changeLanguage('en')}
            className={clsx(
              'px-4 py-1.5 text-xs font-bold border border-black transition-colors',
              i18n.language === 'en'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-slate-100'
            )}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => changeLanguage('hi')}
            className={clsx(
              'px-4 py-1.5 text-xs font-bold border border-black transition-colors',
              i18n.language === 'hi'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-slate-100'
            )}
          >
            हिन्दी
          </button>
        </div>
      </div>
    </aside>
  );
};
