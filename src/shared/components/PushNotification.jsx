import './PushNotification.css'

const PushNotification = ({
  appName = 'MurmanClick',
  title,
  message,
  icon,
  iconClassName = '',
  onClose,
  onClick,
  show,
  index = 0
}) => {
  if (!show) {
return null
}

  return (
    <div 
      className={`telegram-push-notification ${iconClassName}`}
      onClick={onClick}
      style={{
        top: `calc(${8 + index * 85}px + env(safe-area-inset-top, 0))`
      }}
    >
      <div className="push-notification-content">
        <div className={`push-notification-icon ${iconClassName}`}>
          {icon}
        </div>
        <div className="push-notification-text">
          <div className="push-notification-app-name">{appName}</div>
          <div className="push-notification-title">{title}</div>
          {message && (
            <div className="push-notification-message">{message}</div>
          )}
        </div>
      </div>
      <button
        className="push-notification-close"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        aria-label="Закрыть"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  )
}

export default PushNotification

