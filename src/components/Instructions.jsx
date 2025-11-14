import './Instructions.css'

const Instructions = ({ searchType = 'address' }) => {
  const getInstructions = () => {
    if (searchType === 'district') {
      return {
        title: 'Как пользоваться: поиск по району',
        steps: [
          {
            number: 1,
            title: 'Выберите район',
            description: 'Выберите район из списка: Октябрьский, Первомайский или Ленинский'
          },
          {
            number: 2,
            title: 'Выберите количество комнат',
            description: 'Укажите тип квартиры: Студия, 1, 2, 3, 4+ комнат или выберите "Весь район" для анализа всех квартир в районе'
          },
          {
            number: 3,
            title: 'Получите статистику',
            description: 'Нажмите кнопку "Узнать цену" и получите детальный анализ стоимости недвижимости в выбранном районе с графиком изменения цены'
          }
        ]
      }
    } else if (searchType === 'city') {
      return {
        title: 'Как пользоваться: поиск по городу',
        steps: [
          {
            number: 1,
            title: 'Введите название города',
            description: 'Введите название города в поле ввода. Используйте подсказки для быстрого выбора'
          },
          {
            number: 2,
            title: 'Выберите количество комнат',
            description: 'Укажите тип квартиры: Студия, 1, 2, 3, 4+ комнат или выберите "Весь город" для анализа всех квартир в городе'
          },
          {
            number: 3,
            title: 'Получите статистику',
            description: 'Нажмите кнопку "Узнать цену" и получите детальный анализ стоимости недвижимости в выбранном городе с графиком изменения цены'
          }
        ]
      }
    } else {
      return {
        title: 'Как пользоваться сервисом',
        steps: [
          {
            number: 1,
            title: 'Введите адрес недвижимости',
            description: 'Укажите адрес в формате: город, улица, дом. Например: <strong>Мурманск Александрова 30/2</strong>'
          },
          {
            number: 2,
            title: 'Выберите количество комнат',
            description: 'Укажите тип квартиры: Студия, 1, 2, 3 или 4+ комнат'
          },
          {
            number: 3,
            title: 'Получите оценку',
            description: 'Нажмите кнопку "Узнать цену" и получите детальный анализ стоимости недвижимости с графиком изменения цены'
          }
        ]
      }
    }
  }

  const instructions = getInstructions()

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
        <h3 className="instructions-title">{instructions.title}</h3>
      </div>
      <div className="instructions-content">
        {instructions.steps.map((step) => (
          <div key={step.number} className="instruction-step">
            <div className="step-number">{step.number}</div>
            <div className="step-content">
              <h4 className="step-title">{step.title}</h4>
              <p className="step-description" dangerouslySetInnerHTML={{ __html: step.description }} />
            </div>
          </div>
        ))}
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

