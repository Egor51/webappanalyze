import { useState } from 'react'
import './ExpertModal.css'

const ExpertModal = ({ option, onClose, onSuccess }) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // TODO: Отправка лида на сервер
      const leadData = {
        objectId: option.url || option.fullAddress,
        objectAddress: option.fullAddress,
        objectPrice: option.price,
        name,
        phone,
        email,
        message,
        timestamp: Date.now()
      }

      // Имитация отправки
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Лид отправлен:', leadData)
      
      // TODO: Реальная отправка через API
      // await fetch('/api/invest/leads', { method: 'POST', body: JSON.stringify(leadData) })
      
      onSuccess()
    } catch (error) {
      console.error('Ошибка отправки лида:', error)
      alert('Ошибка отправки. Попробуйте позже.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="expert-modal-overlay" onClick={onClose}>
      <div className="expert-modal" onClick={(e) => e.stopPropagation()}>
        <button className="expert-modal-close" onClick={onClose}>×</button>
        
        <div className="expert-modal-content">
          <div className="expert-modal-header">
            <h3>Обсудить объект с экспертом</h3>
            <p>Наш партнер свяжется с вами для консультации по объекту</p>
          </div>

          <div className="expert-object-info">
            <h4>{option.fullAddress || 'Адрес не указан'}</h4>
            {option.price && (
              <p className="expert-object-price">{typeof option.price === 'number' ? `${(option.price / 1000000).toFixed(1)} млн ₽` : option.price}</p>
            )}
          </div>

          <form className="expert-form" onSubmit={handleSubmit}>
            <div className="expert-form-group">
              <label>Ваше имя *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Иван Иванов"
              />
            </div>

            <div className="expert-form-group">
              <label>Телефон *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div className="expert-form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ivan@example.com"
              />
            </div>

            <div className="expert-form-group">
              <label>Сообщение (опционально)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ваши вопросы или пожелания..."
                rows="4"
              />
            </div>

            <div className="expert-form-actions">
              <button type="button" className="expert-cancel" onClick={onClose}>
                Отмена
              </button>
              <button type="submit" className="expert-submit" disabled={submitting}>
                {submitting ? 'Отправка...' : 'Отправить заявку'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ExpertModal

