import { useTheme } from '../../context/ThemeContext'
import './Header.css'

const Header = ({ currentScreen, onNavigateToInvesting, onNavigateToSearch, onNavigateToUrgentBuy }) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <header className="header">
        <div className="header-content">
          {/* Логотип с иконкой */}
          <div className="logo" onClick={onNavigateToSearch} style={{ cursor: 'pointer' }}>
            <div className="logo-icon-wrapper">
              {/* <svg className="logo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg> */}
            </div>
            <div className="logo-text">
              <h1>murmanclick</h1>
              <span className="logo-tagline">Центр недвижимости</span>
            </div>
          </div>

          {/* Мини-триггер доверия (только на десктопе) */}
          <div className="header-trust-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            <span>10+ лет опыта</span>
          </div>

          {/* Навигация */}
          <div className="header-actions">
            {/* Кнопка "Оценка" */}
            {onNavigateToSearch && (
              <button 
                className={`nav-button evaluation-nav-button ${currentScreen === 'search' ? 'active' : ''}`}
                onClick={onNavigateToSearch} 
                aria-label="Оценка"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span>Оценка</span>
              </button>
            )}
            
            {/* Кнопка "Инвестиции" - выделенная */}
            {onNavigateToInvesting && (
              <button 
                className={`nav-button investing-nav-button featured ${currentScreen === 'investing' ? 'active' : ''}`}
                onClick={onNavigateToInvesting} 
                aria-label="Инвестиции"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="2" x2="12" y2="22"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span>Инвестиции</span>
                <span className="nav-badge">PRO</span>
              </button>
            )}
            
            {/* Кнопка "Срочная покупка" - CTA стиль */}
            {onNavigateToUrgentBuy && (
              <button 
                className={`nav-button urgent-buy-nav-button cta ${currentScreen === 'urgent-buy' ? 'active' : ''}`}
                onClick={onNavigateToUrgentBuy} 
                aria-label="Срочная покупка"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>Срочная покупка</span>
              </button>
            )}
            
            {/* Переключатель тем - улучшенный */}
            <button 
              className="theme-toggle" 
              onClick={toggleTheme} 
              aria-label="Переключить тему"
            >
              <div className="theme-toggle-inner">
                {theme === 'dark' ? (
                  <svg className="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg className="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Нижнее меню для мобильных устройств */}
      <nav className="bottom-navigation">
        <button 
          className={`bottom-nav-item ${currentScreen === 'search' ? 'active' : ''}`}
          onClick={onNavigateToSearch}
          aria-label="Оценка"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <span>Оценка</span>
        </button>

        <button 
          className={`bottom-nav-item ${currentScreen === 'urgent-buy' ? 'active' : ''}`}
          onClick={onNavigateToUrgentBuy}
          aria-label="Продать"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span>Продать</span>
        </button>

        <button 
          className={`bottom-nav-item ${currentScreen === 'investing' ? 'active' : ''}`}
          onClick={onNavigateToInvesting}
          aria-label="Инвестиции"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="22"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <span>Инвестиции</span>
        </button>
      </nav>
    </>
  )
}

export default Header

