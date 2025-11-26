import { useState, useEffect, useRef } from 'react'
import { useSubmitUrgentSaleForm } from '../hooks'
import { useTrackEvent } from '../../analytics/hooks'
import { logger } from '../../../shared/utils/logger'
import './UrgentBuyPage.css'

const UrgentBuyPage = ({ onNavigateToSearch, onNavigateToInvesting }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    objectType: '',
    description: ''
  })
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState(null)
  const formRef = useRef(null)

  // React Query mutation для отправки формы
  const submitFormMutation = useSubmitUrgentSaleForm()
  const trackEventMutation = useTrackEvent()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await submitFormMutation.mutateAsync(formData)
      setFormSubmitted(true)
      
      // Отправляем событие аналитики
      trackEventMutation.mutate({
        name: 'urgent_sale_application_sent',
        properties: {
          city: formData.city,
          objectType: formData.objectType,
        },
        timestamp: Date.now(),
      })
      
      logger.debug('Заявка на срочную продажу отправлена', { city: formData.city })
    } catch (error) {
      logger.error('Ошибка при отправке заявки', error, { context: 'UrgentSale' })
      // Ошибка уже обработана в mutation
    }
  }

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const faqItems = [
    {
      question: 'Как формируется цена выкупа? Не занижаете ли вы цену?',
      answer: 'Цена формируется на основе реальной аналитики рынка недвижимости Мурманска и области. Мы используем собственный сервис анализа цен, который учитывает актуальные предложения, историю сделок и рыночные тренды. Вы можете получить предварительную оценку онлайн и убедиться в справедливости цены. Мы гарантируем, что цена не занижается — только реальная рыночная стоимость на основе данных.'
    },
    {
      question: 'Сколько длится процесс от заявки до расчёта? Гарантируете ли вы сроки?',
      answer: 'Обычно весь процесс занимает от 3 до 7 рабочих дней. Это зависит от сложности проверки документов и готовности объекта. Мы стараемся максимально ускорить процесс, сохраняя при этом юридическую чистоту сделки. Гарантируем, что деньги будут на вашем счёте в оговоренные сроки — никаких задержек.'
    },
    {
      question: 'Нужно ли мне собирать пакет документов самому?',
      answer: 'Нет, мы помогаем вам на всех этапах. Наши специалисты проверят наличие всех необходимых документов, при необходимости помогут их восстановить или оформить. Вы не останетесь один на один с бюрократией. Мы берём на себя все организационные вопросы.'
    },
    {
      question: 'Что если на квартире есть долг, ипотека или другие обременения?',
      answer: 'Мы работаем с объектами, на которых есть долги, ипотека, аресты, залоги или другие обременения. Наши специалисты помогут решить эти вопросы в рамках сделки. Каждая ситуация рассматривается индивидуально. Мы не отказываем в сложных случаях — находим решение для каждой ситуации.'
    },
    {
      question: 'Безопасна ли сделка? Не обманут ли меня?',
      answer: 'Да, абсолютно безопасна. Все сделки проходят через официальное оформление у нотариуса или в офисе партнёра. Мы предоставляем полное юридическое сопровождение и гарантируем чистоту сделки. Работаем более 10 лет на рынке Мурманской области, сотни довольных клиентов. Мы дорожим репутацией и не рискуем ею.'
    },
    {
      question: 'Что будет после того, как я оставлю заявку? Будут ли названивать?',
      answer: 'После отправки заявки мы свяжемся с вами один раз в удобное для вас время. Никаких навязчивых звонков, никакой продажи данных третьим лицам. Мы гарантируем конфиденциальность. Если вы не готовы общаться сейчас, мы можем связаться позже — в удобное для вас время.'
    },
    {
      question: 'Почему вы предлагаете такую быструю сделку? В чём подвох?',
      answer: 'Никакого подвоха. Это наша бизнес-модель: мы покупаем недвижимость для дальнейшей работы с ней (продажа, аренда, инвестиции). Нам выгодно работать быстро и честно — так мы строим репутацию и получаем больше клиентов. Мы объясняем все условия прозрачно, без скрытых платежей. Это выгодно обеим сторонам.'
    }
  ]

  return (
    <div className="urgent-buy-page">
      {/* Hero блок */}
      <section className="urgent-buy-hero">
        <div className="urgent-buy-hero-content">
          <h1 className="urgent-buy-title">
            Покупаем недвижимость в Мурманске и области
          </h1>
          <p className="urgent-buy-subtitle">
            <span className="desktop-text">
              Компания <strong>«МурманКлик»</strong> выкупает недвижимость быстро, безопасно и по честной цене. 
              Используем собственный сервис аналитики рынка для точной оценки. <strong>Гарантируем</strong>, что сделка состоится, 
              деньги будут на вашем счёте в оговоренные сроки. Работаем более 10 лет, сотни довольных клиентов.
            </span>
            <span className="mobile-text">
              <strong>«МурманКлик»</strong> выкупает недвижимость быстро и по честной цене.
              {/* <br/>
              Собственный сервис аналитики для точной оценки.<br/> */}
              {/* <strong>Гарантируем</strong> сделку и деньги в срок. 10+ лет опыта. */}
            </span>
          </p>
          
          <div className="urgent-buy-cta-buttons">
            <button 
              className="urgent-buy-cta-primary"
              onClick={scrollToForm}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span className="desktop-text">Оставить заявку на срочную продажу</span>
              <span className="mobile-text">Оставить заявку</span>
            </button>
            <button 
              className="urgent-buy-cta-secondary"
              onClick={onNavigateToSearch}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <span>Рассчитать цену онлайн</span>
            </button>
          </div>

          <div className="urgent-buy-trust-badges">
            <div className="trust-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              <span>Работаем более 10 лет</span>
            </div>
            <div className="trust-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Сотни довольных клиентов</span>
            </div>
            <div className="trust-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3z"></path>
                <path d="M12 3c0 1-1 3-3 3S6 4 6 3s1-3 3-3 3 2 3 3z"></path>
              </svg>
              <span>Юридически чистые сделки</span>
            </div>
          </div>
        </div>
      </section>

      {/* Блок социальных доказательств (вынесен выше для усиления доверия) */}
      <section className="urgent-buy-social-proof-top">
        <div className="social-proof-grid">
          <div className="social-proof-item">
            <div className="social-proof-number">10+</div>
            <div className="social-proof-label">лет на рынке</div>
          </div>
          <div className="social-proof-item">
            <div className="social-proof-number">Сотни</div>
            <div className="social-proof-label">успешных сделок</div>
          </div>
          <div className="social-proof-item">
            <div className="social-proof-number">Сотни</div>
            <div className="social-proof-label">довольных клиентов</div>
          </div>
          <div className="social-proof-item">
            <div className="social-proof-number">100%</div>
            <div className="social-proof-label">официальные сделки</div>
          </div>
        </div>
      </section>

      {/* Блок доверия и преимуществ */}
      <section className="urgent-buy-benefits">
        <div className="urgent-buy-section-header">
          <h2 className="urgent-buy-section-title">Почему продавать через МурманКлик</h2>
          <p className="urgent-buy-section-subtitle">
            <span className="desktop-text">
              Мы решаем вашу проблему, а не создаём новую. Простой процесс, гарантия сделки, честная цена — 
              без стресса от показов, переговоров и долгого ожидания.
            </span>
            <span className="mobile-text">
              Простой процесс, гарантия сделки, честная цена.<br/>
              Без показов, переговоров и долгого ожидания.
            </span>
          </p>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h3 className="benefit-title">Честная цена на основе реальной аналитики</h3>
            <p className="benefit-description">
              <span className="desktop-text">
                Собственный сервис анализа рынка для точной оценки.<br/>
                Предварительная оценка онлайн — убедитесь в справедливости цены.<br/>
                Никаких занижений, только реальная рыночная стоимость.
              </span>
              <span className="mobile-text">
                Собственный сервис аналитики.<br/>
                Оценка онлайн. Без занижений.
              </span>
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 className="benefit-title">Гарантия сделки и быстрый расчёт</h3>
            <p className="benefit-description">
              <span className="desktop-text">
                От заявки до расчёта — 3-7 рабочих дней.<br/>
                <strong>Гарантируем</strong> сделку и деньги на вашем счёте в срок.<br/>
                Без ожидания покупателей, показов и долгих переговоров.
              </span>
              <span className="mobile-text">
                3-7 дней от заявки до расчёта.<br/>
                <strong>Гарантируем</strong> сделку и деньги в срок.<br/>
                Без показов и переговоров.
              </span>
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="benefit-title">Юридическое сопровождение и безопасность</h3>
            <p className="benefit-description">
              <span className="desktop-text">
                Полная проверка документов и прав.<br/>
                Официальное оформление у нотариуса или в офисе партнёра.<br/>
                Гарантируем юридическую чистоту — вы защищены от рисков.
              </span>
              <span className="mobile-text">
                Проверка документов и прав.<br/>
                Оформление у нотариуса.<br/>
                Юридическая чистота сделки.
              </span>
            </p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h3 className="benefit-title">Работаем со сложными ситуациями</h3>
            <p className="benefit-description">
              <span className="desktop-text">
                Покупаем объекты с ипотекой, долгами, обременениями, арестами.<br/>
                Помогаем решить любые юридические вопросы в рамках сделки.<br/>
                Не отказываем в сложных случаях — находим решение.
              </span>
              <span className="mobile-text">
                Покупаем с ипотекой, долгами, арестами.<br/>
                Решаем юридические вопросы.<br/>
                Не отказываем в сложных случаях.
              </span>
            </p>
          </div>
        </div>

        <div className="experience-badge">
          <div className="experience-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div className="experience-content">
            <h3 className="experience-title">10+ лет на рынке недвижимости Мурманска и области</h3>
            <p className="experience-description">
              <span className="desktop-text">
                Мы знаем местный рынок изнутри, имеем репутацию надёжного партнёра и предлагаем лучшие условия для продажи вашей недвижимости. 
                Сотни успешных сделок, доверие клиентов, партнёрства с нотариусами и юристами.
              </span>
              <span className="mobile-text">
                Знаем местный рынок изнутри.<br/>
                Сотни успешных сделок.<br/>
                Партнёрства с нотариусами и юристами.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Пошаговый процесс */}
      <section className="urgent-buy-process">
        <div className="urgent-buy-section-header">
          <h2 className="urgent-buy-section-title">Как всё проходит</h2>
          <p className="urgent-buy-section-subtitle">
            Простой и понятный процесс от заявки до расчёта
          </p>
        </div>

        <div className="process-steps">
          <div className="process-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3 className="step-title">Заявка</h3>
              <p className="step-description">
                <span className="desktop-text">
                  Оставьте свои контакты и данные по объекту. Мы свяжемся с вами в течение рабочего дня в удобное для вас время. 
                  Один звонок — без навязчивости. Гарантируем конфиденциальность ваших данных.
                </span>
                <span className="mobile-text">
                  Оставьте контакты и данные.<br/>
                  Свяжемся в удобное время.<br/>
                  Один звонок, конфиденциально.
                </span>
              </p>
            </div>
          </div>

          <div className="process-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="step-title">Онлайн-оценка</h3>
              <p className="step-description">
                <span className="desktop-text">
                  Используем наш собственный сервис аналитики рынка и даём предварительный диапазон стоимости на основе реальных рыночных данных. 
                  Вы можете получить оценку онлайн прямо сейчас и убедиться в справедливости цены. Прозрачно, без скрытых условий.
                </span>
                <span className="mobile-text">
                  Собственный сервис аналитики.<br/>
                  Оценка онлайн прямо сейчас.<br/>
                  Прозрачно, без скрытых условий.
                </span>
              </p>
            </div>
          </div>

          <div className="process-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3 className="step-title">Выезд и проверка документов</h3>
              <p className="step-description">
                <span className="desktop-text">
                  При необходимости осматриваем объект. Проверяем все права и документы. <strong>Мы помогаем вам</strong> собрать недостающие бумаги, 
                  при необходимости восстановим документы. Вы не останетесь один на один с бюрократией.
                </span>
                <span className="mobile-text">
                  Осмотр объекта и проверка документов.<br/>
                  <strong>Помогаем</strong> собрать бумаги.<br/>
                  Не оставим с бюрократией.
                </span>
              </p>
            </div>
          </div>

          <div className="process-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3 className="step-title">Сделка</h3>
              <p className="step-description">
                <span className="desktop-text">
                  Оформление у нотариуса или в офисе партнёра. Полное юридическое сопровождение. Все официально, безопасно и прозрачно. 
                  Вы в курсе каждого шага, контролируете процесс. Гарантируем чистоту сделки.
                </span>
                <span className="mobile-text">
                  Оформление у нотариуса.<br/>
                  Полное юридическое сопровождение.<br/>
                  Безопасно и прозрачно.
                </span>
              </p>
            </div>
          </div>

          <div className="process-step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3 className="step-title">Расчёт</h3>
              <p className="step-description">
                <span className="desktop-text">
                  Быстрый расчёт удобным для вас способом. <strong>Гарантируем</strong>, что деньги будут на вашем счёте в оговоренные сроки. 
                  Никаких задержек, никаких скрытых платежей. Вы получаете то, что обещано.
                </span>
                <span className="mobile-text">
                  Быстрый расчёт удобным способом.<br/>
                  <strong>Гарантируем</strong> деньги в срок.<br/>
                  Без задержек и скрытых платежей.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Блок "Почему это выгодно именно сейчас" */}
      <section className="urgent-buy-why-now">
        <div className="urgent-buy-section-header">
          <h2 className="urgent-buy-section-title">Почему это выгодно именно сейчас</h2>
          <p className="urgent-buy-section-subtitle">
            <span className="desktop-text">
              Не теряйте время и деньги. Продайте недвижимость быстро, получите гарантированный результат и начните новую жизнь без проблем.
            </span>
            <span className="mobile-text">
              Продайте быстро, получите результат.<br/>
              Начните новую жизнь без проблем.
            </span>
          </p>
        </div>

        <div className="why-now-grid">
          <div className="why-now-item">
            <div className="why-now-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="why-now-title">Рынок волатилен</h3>
              <p className="why-now-description">
                Цены меняются быстро.<br/>
                Зафиксируйте выгодную цену без долгого ожидания.
              </p>
            </div>
          </div>

          <div className="why-now-item">
            <div className="why-now-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="why-now-title">Экономия времени</h3>
              <p className="why-now-description">
                Без показов, переговоров и торгов.<br/>
                Мы берём всё на себя.
              </p>
            </div>
          </div>

          <div className="why-now-item">
            <div className="why-now-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div>
              <h3 className="why-now-title">Честная цена</h3>
              <p className="why-now-description">
                Не теряете в стоимости.<br/>
                Оценка на основе реальной аналитики рынка, без занижений.
              </p>
            </div>
          </div>

          <div className="why-now-item">
            <div className="why-now-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <div>
              <h3 className="why-now-title">Быстрое решение</h3>
              <p className="why-now-description">
                От заявки до расчёта — несколько дней.<br/>
                Идеально для срочных ситуаций.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Интеграция с сервисом оценки */}
      <section className="urgent-buy-evaluation">
        <div className="evaluation-card">
          <div className="evaluation-content">
            <h2 className="evaluation-title">
              <span className="desktop-text">Точная оценка на основе реальной аналитики — наше ключевое отличие</span>
              <span className="mobile-text">Точная оценка на основе аналитики</span>
            </h2>
            <p className="evaluation-description">
              <span className="desktop-text">
                В отличие от конкурентов, которые оценивают "на глаз", МурманКлик использует <strong>собственный сервис анализа рынка</strong> недвижимости. 
                Он учитывает актуальные предложения, историю сделок и рыночные тренды. Вы видите, как формируется цена — прозрачно и честно. 
                Получите предварительную оценку вашего объекта прямо сейчас и убедитесь в справедливости наших расчётов.
              </span>
              <span className="mobile-text">
                <strong>Собственный сервис анализа</strong> рынка.<br/>
                Учитывает актуальные предложения и тренды.<br/>
                Прозрачно и честно. Оценка онлайн.
              </span>
            </p>
            <button 
              className="evaluation-button"
              onClick={onNavigateToSearch}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <span className="desktop-text">Рассчитать ориентировочную цену сейчас</span>
              <span className="mobile-text">Рассчитать цену</span>
            </button>
          </div>
          <div className="evaluation-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Блок сравнения с альтернативами */}
      <section className="urgent-buy-comparison">
        <div className="urgent-buy-section-header">
          <h2 className="urgent-buy-section-title">Почему быстрый выкуп лучше, чем обычная продажа</h2>
          <p className="urgent-buy-section-subtitle">
            <span className="desktop-text">
              Сравните сами: что вы получаете с МурманКлик и что ждёт вас при обычной продаже
            </span>
            <span className="mobile-text">
              Сравните: МурманКлик vs обычная продажа
            </span>
          </p>
        </div>

        <div className="comparison-table">
          <div className="comparison-header">
            <div className="comparison-cell comparison-empty"></div>
            <div className="comparison-cell comparison-our">
              <strong>МурманКлик</strong>
            </div>
            <div className="comparison-cell comparison-other">
              <strong>Риелтор / Самостоятельная продажа</strong>
            </div>
          </div>
          
          <div className="comparison-row">
            <div className="comparison-cell comparison-label">Срок продажи</div>
            <div className="comparison-cell comparison-our">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>3-7 дней</span>
            </div>
            <div className="comparison-cell comparison-other">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>3-6 месяцев</span>
            </div>
          </div>

          <div className="comparison-row">
            <div className="comparison-cell comparison-label">Гарантия продажи</div>
            <div className="comparison-cell comparison-our">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Гарантируем</span>
            </div>
            <div className="comparison-cell comparison-other">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <span>Нет гарантии</span>
            </div>
          </div>

          <div className="comparison-row">
            <div className="comparison-cell comparison-label">Нужны ли показы</div>
            <div className="comparison-cell comparison-our">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Не нужны</span>
            </div>
            <div className="comparison-cell comparison-other">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <span>Много показов</span>
            </div>
          </div>

          <div className="comparison-row">
            <div className="comparison-cell comparison-label">Комиссия</div>
            <div className="comparison-cell comparison-our">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Без комиссии</span>
            </div>
            <div className="comparison-cell comparison-other">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <span>2-5% комиссия</span>
            </div>
          </div>

          <div className="comparison-row">
            <div className="comparison-cell comparison-label">Юридическая безопасность</div>
            <div className="comparison-cell comparison-our">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Полное сопровождение</span>
            </div>
            <div className="comparison-cell comparison-other">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>Риски мошенничества</span>
            </div>
          </div>

          <div className="comparison-row">
            <div className="comparison-cell comparison-label">Оценка цены</div>
            <div className="comparison-cell comparison-our">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>На основе аналитики</span>
            </div>
            <div className="comparison-cell comparison-other">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>"На глаз" или торги</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="urgent-buy-faq">
        <div className="urgent-buy-section-header">
          <h2 className="urgent-buy-section-title">Часто задаваемые вопросы</h2>
          <p className="urgent-buy-section-subtitle">
            Ответы на типичные вопросы о срочной покупке недвижимости
          </p>
        </div>

        <div className="faq-list">
          {faqItems.map((item, index) => (
            <div 
              key={index} 
              className={`faq-item ${expandedFaq === index ? 'expanded' : ''}`}
              onClick={() => toggleFaq(index)}
            >
              <div className="faq-question">
                <span>{item.question}</span>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="faq-arrow"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              {expandedFaq === index && (
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Форма заявки */}
      <section className="urgent-buy-form-section" ref={formRef}>
        <div className="urgent-buy-section-header">
          <h2 className="urgent-buy-section-title">Оставьте заявку на срочную продажу недвижимости</h2>
          <p className="urgent-buy-section-subtitle">
            Мы свяжемся с вами один раз в удобное для вас время, уточним детали и предложим честную цену на основе реальной аналитики рынка. 
            Гарантируем конфиденциальность ваших данных. Никаких навязчивых звонков, никакой продажи данных третьим лицам.
          </p>
        </div>

        {formSubmitted ? (
          <div className="form-success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h3>Заявка отправлена!</h3>
            <p>Мы свяжемся с вами в ближайшее время</p>
          </div>
        ) : (
          <form className="urgent-buy-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Имя *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ваше имя"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Телефон *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">Город/населённый пункт *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  placeholder="Мурманск"
                />
              </div>
              <div className="form-group">
                <label htmlFor="objectType">Тип объекта *</label>
                <select
                  id="objectType"
                  name="objectType"
                  value={formData.objectType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Выберите тип</option>
                  <option value="квартира">Квартира</option>
                  <option value="дом">Дом</option>
                  <option value="комната">Комната</option>
                  <option value="коммерческая">Коммерческая</option>
                  <option value="другое">Другое</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Краткое описание / адрес</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Адрес объекта, количество комнат, площадь и другая важная информация"
              />
            </div>

            <button type="submit" className="form-submit-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              <span>Отправить заявку</span>
            </button>

            <p className="form-privacy">
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных и политикой конфиденциальности. 
              Мы свяжемся с вами один раз в удобное время. Ваши данные не передаются третьим лицам и используются только для связи с вами.
            </p>
          </form>
        )}
      </section>
    </div>
  )
}

export default UrgentBuyPage

