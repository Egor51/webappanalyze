import './Instructions.css'

const Instructions = () => {
  return (
    <div className="instructions">
      <div className="instructions-header">
        <div className="instructions-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <h3 className="instructions-title">Как пользоваться сервисом</h3>
      </div>
      <div className="instructions-content">
        <div className="instruction-step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h4 className="step-title">Введите адрес недвижимости</h4>
            <p className="step-description">
              Укажите адрес в формате: город, улица, дом. Например: <strong>Мурманск Александрова 30/2</strong>
            </p>
          </div>
        </div>
        <div className="instruction-step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h4 className="step-title">Выберите количество комнат</h4>
            <p className="step-description">
              Укажите тип квартиры: Студия, 1, 2, 3 или 4+ комнат
            </p>
          </div>
        </div>
        <div className="instruction-step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h4 className="step-title">Получите оценку</h4>
            <p className="step-description">
              Нажмите кнопку "Узнать цену" и получите детальный анализ стоимости недвижимости с графиком изменения цены
            </p>
          </div>
        </div>
      </div>
      <div className="instructions-footer">
        <div className="info-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
          <span>Данные основаны на анализе объявлений о продаже недвижимости</span>
        </div>
      </div>
    </div>
  )
}

export default Instructions

