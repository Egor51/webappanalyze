import { useMemo, useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import './Results.css'

const formatPrice = (price) => {
  if (typeof price === 'number') {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн`
    }
    return `${Math.round(price).toLocaleString('ru-RU')} ₽`
  }
  return price
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })
}

const Results = ({ data }) => {
  const [shareSuccess, setShareSuccess] = useState(false)
  const [chartExpanded, setChartExpanded] = useState(false)
  const [showMinTooltip, setShowMinTooltip] = useState(false)
  const [showMaxTooltip, setShowMaxTooltip] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const chartContainerRef = useRef(null)
  
  // Обрабатываем данные: если это массив, берем первый элемент, иначе используем сам объект
  const result = Array.isArray(data) ? data[0] : data
  
  // Закрываем подсказки при клике на экран
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Проверяем, что клик не был на кнопке подсказки
      if (!event.target.closest('.tooltip-trigger')) {
        setShowMinTooltip(false)
        setShowMaxTooltip(false)
      }
    }
    
    if (showMinTooltip || showMaxTooltip) {
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [showMinTooltip, showMaxTooltip])

  // Логирование для отладки
  console.log('Results component - data:', data)
  console.log('Results component - result:', result)

  const chartData = useMemo(() => {
    if (!result?.analytics) {
      console.log('No analytics data in result')
      return []
    }
    return result.analytics.map((item) => ({
      date: formatDate(item.date),
      price: item.avgPrice,
      fullDate: item.date,
    }))
  }, [result])
  
  const generatePDF = async () => {
    setIsGeneratingPDF(true)
    try {
      // Создаем временный контейнер для PDF контента (оптимизированный размер)
      const pdfContainer = document.createElement('div')
      pdfContainer.style.position = 'absolute'
      pdfContainer.style.left = '-9999px'
      pdfContainer.style.width = '595px' // A4 width в пикселях при 72 DPI (меньше для оптимизации)
      pdfContainer.style.backgroundColor = '#ffffff'
      pdfContainer.style.padding = '30px'
      pdfContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      pdfContainer.style.color = '#000000'
      pdfContainer.style.lineHeight = '1.5'

      // Заголовок
      const header = document.createElement('div')
      header.style.textAlign = 'center'
      header.style.marginBottom = '20px'
      
      const title = document.createElement('h1')
      title.innerHTML = `Анализ стоимости объекта недвижимости<br/>${result.address}`
      title.style.fontSize = '22px'
      title.style.fontWeight = 'bold'
      title.style.color = '#2196F3'
      title.style.margin = '0 0 8px 0'
      title.style.lineHeight = '1.3'
      header.appendChild(title)
      
      const subtitle = document.createElement('div')
      subtitle.textContent = 'MurmanClick'
      subtitle.style.fontSize = '12px'
      subtitle.style.color = '#666666'
      header.appendChild(subtitle)
      pdfContainer.appendChild(header)

      // Средняя цена
      const priceSection = document.createElement('div')
      priceSection.style.marginBottom = '20px'
      
      const priceLabel = document.createElement('div')
      priceLabel.textContent = 'Средняя цена'
      priceLabel.style.fontSize = '16px'
      priceLabel.style.fontWeight = 'bold'
      priceLabel.style.color = '#2196F3'
      priceLabel.style.marginBottom = '8px'
      priceSection.appendChild(priceLabel)
      
      const priceValue = document.createElement('div')
      priceValue.textContent = `${result.price} ₽`
      priceValue.style.fontSize = '22px'
      priceValue.style.fontWeight = 'bold'
      priceValue.style.marginBottom = '12px'
      priceSection.appendChild(priceValue)
      
      // Детали цены
      const priceDetails = document.createElement('div')
      priceDetails.style.fontSize = '11px'
      priceDetails.style.color = '#555555'
      priceDetails.innerHTML = `
        <div style="margin-bottom: 4px;">За м²: ${result.priceMeter} ₽</div>
        <div style="margin-bottom: 4px;">Мин: ${result.priceMin} ₽</div>
        <div>Макс: ${result.priceMax} ₽</div>
      `
      priceSection.appendChild(priceDetails)
      pdfContainer.appendChild(priceSection)

      // Изменение цены
      const changeSection = document.createElement('div')
      changeSection.style.marginBottom = '20px'
      
      const changeLabel = document.createElement('div')
      changeLabel.textContent = 'Изменение цены'
      changeLabel.style.fontSize = '16px'
      changeLabel.style.fontWeight = 'bold'
      changeLabel.style.marginBottom = '8px'
      changeSection.appendChild(changeLabel)
      
      const annualChange = result.annualPriceChangePercent > 0 ? '+' : ''
      const threeMonthChange = result.threeMonthPriceChangePercent > 0 ? '+' : ''
      const changeDetails = document.createElement('div')
      changeDetails.style.fontSize = '11px'
      changeDetails.style.color = '#555555'
      changeDetails.innerHTML = `
        <div style="margin-bottom: 4px;">За год: ${annualChange}${result.annualPriceChangePercent.toFixed(2)}%</div>
        <div>За 3 месяца: ${threeMonthChange}${result.threeMonthPriceChangePercent.toFixed(2)}%</div>
      `
      changeSection.appendChild(changeDetails)
      pdfContainer.appendChild(changeSection)

      // График (оптимизированный)
      if (chartContainerRef.current && chartData.length > 0) {
        try {
          // Используем scale: 1 вместо 2 для уменьшения размера
          const chartCanvas = await html2canvas(chartContainerRef.current, {
            backgroundColor: '#ffffff',
            scale: 1, // Уменьшено с 2 до 1 для оптимизации размера
            logging: false,
            useCORS: true,
            width: 535, // Оптимизированная ширина
            height: 250 // Оптимизированная высота
          })
          
          // Конвертируем в JPEG с качеством 0.85 для уменьшения размера
          const chartImage = chartCanvas.toDataURL('image/jpeg', 0.85)
          
          // Ждем загрузки изображения
          await new Promise((resolve) => {
            const chartImg = new Image()
            chartImg.onload = resolve
            chartImg.onerror = resolve
            chartImg.src = chartImage
          })
          
          const chartDiv = document.createElement('div')
          chartDiv.style.marginBottom = '20px'
          const chartImg = document.createElement('img')
          chartImg.src = chartImage
          chartImg.style.width = '100%'
          chartImg.style.height = 'auto'
          chartImg.style.display = 'block'
          chartImg.style.maxWidth = '535px'
          chartDiv.appendChild(chartImg)
          pdfContainer.appendChild(chartDiv)
        } catch (chartError) {
          console.error('Ошибка при генерации графика:', chartError)
        }
      }

      // Блок с данными компании и призывом к действию
      const companySection = document.createElement('div')
      companySection.style.marginTop = '30px'
      companySection.style.marginBottom = '20px'
      companySection.style.padding = '20px'
      companySection.style.backgroundColor = '#f8f9fa'
      companySection.style.borderRadius = '8px'
      companySection.style.border = '2px solid #2196F3'
      
      // Заголовок блока компании
      const companyTitle = document.createElement('div')
      companyTitle.textContent = 'Центр недвижимости МурманКлик'
      companyTitle.style.fontSize = '18px'
      companyTitle.style.fontWeight = 'bold'
      companyTitle.style.color = '#2196F3'
      companyTitle.style.marginBottom = '15px'
      companyTitle.style.textAlign = 'center'
      companySection.appendChild(companyTitle)
      
      // Контактная информация
      const contactInfo = document.createElement('div')
      contactInfo.style.fontSize = '12px'
      contactInfo.style.color = '#333333'
      contactInfo.style.marginBottom = '15px'
      contactInfo.style.lineHeight = '1.8'
      contactInfo.innerHTML = `
        <div style="margin-bottom: 6px;"><strong>📞 Телефон:</strong> +7(8152) 707705</div>
        <div style="margin-bottom: 6px;"><strong>📍 Адрес:</strong> Мурманск, пр-т Ленина 52, ДЦ Аметист, 4 этаж, офис 405</div>
      `
      companySection.appendChild(contactInfo)
      
      // Призыв к действию
      const callToAction = document.createElement('div')
      callToAction.style.marginTop = '15px'
      callToAction.style.paddingTop = '15px'
      callToAction.style.borderTop = '1px solid #dee2e6'
      
      const callToActionTitle = document.createElement('div')
      callToActionTitle.textContent = 'Наши услуги:'
      callToActionTitle.style.fontSize = '14px'
      callToActionTitle.style.fontWeight = 'bold'
      callToActionTitle.style.color = '#2196F3'
      callToActionTitle.style.marginBottom = '12px'
      callToAction.appendChild(callToActionTitle)
      
      const servicesList = document.createElement('div')
      servicesList.style.fontSize = '12px'
      servicesList.style.color = '#333333'
      servicesList.style.lineHeight = '2'
      servicesList.innerHTML = `
        <div style="margin-bottom: 8px;">🏠 <strong>Покупка недвижимости</strong> - Поможем найти идеальный вариант</div>
        <div style="margin-bottom: 8px;">💰 <strong>Продажа недвижимости</strong> - Максимально выгодная цена</div>
        <div style="margin-bottom: 8px;">⚡ <strong>Срочный выкуп недвижимости</strong> - Быстрое решение ваших задач</div>
      `
      callToAction.appendChild(servicesList)
      
      const contactButton = document.createElement('div')
      contactButton.style.marginTop = '15px'
      contactButton.style.padding = '10px'
      contactButton.style.backgroundColor = '#2196F3'
      contactButton.style.color = '#ffffff'
      contactButton.style.borderRadius = '6px'
      contactButton.style.textAlign = 'center'
      contactButton.style.fontSize = '13px'
      contactButton.style.fontWeight = 'bold'
      contactButton.textContent = 'Свяжитесь с нами для консультации!'
      callToAction.appendChild(contactButton)
      
      companySection.appendChild(callToAction)
      pdfContainer.appendChild(companySection)

      // Футер
      const footer = document.createElement('div')
      footer.style.marginTop = '20px'
      footer.style.paddingTop = '15px'
      footer.style.borderTop = '1px solid #e0e0e0'
      footer.style.fontSize = '9px'
      footer.style.color = '#999999'
      
      const date = new Date().toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      footer.innerHTML = `
        <div style="margin-bottom: 6px;">Отчет сгенерирован: ${date}</div>
        <div>Данные собраны из открытых источников и носят информационный характер.</div>
      `
      pdfContainer.appendChild(footer)

      // Добавляем контейнер в DOM
      document.body.appendChild(pdfContainer)

      // Ждем отрисовки контента
      await new Promise(resolve => setTimeout(resolve, 50))

      // Конвертируем в изображение с оптимизацией
      const canvas = await html2canvas(pdfContainer, {
        backgroundColor: '#ffffff',
        scale: 1, // Уменьшено с 2 до 1 для оптимизации размера
        logging: false,
        useCORS: true,
        width: pdfContainer.offsetWidth,
        height: pdfContainer.offsetHeight
      })

      // Удаляем временный контейнер
      document.body.removeChild(pdfContainer)

      // Конвертируем в JPEG с качеством 0.85 для уменьшения размера
      const imgData = canvas.toDataURL('image/jpeg', 0.85)

      // Создаем PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * pageWidth) / canvas.width

      // Если контент не помещается на одну страницу, разбиваем на несколько
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Сохраняем PDF
      const fileName = `Оценка_недвижимости_${new Date().getTime()}.pdf`
      const pdfBlob = pdf.output('blob')
      
      return { pdfBlob, fileName }
    } catch (error) {
      console.error('Ошибка при генерации PDF:', error)
      throw error
    } finally {
      setIsGeneratingPDF(false)
    }
  }
  
  const handleShare = async () => {
    try {
      setIsGeneratingPDF(true)
      const { pdfBlob, fileName } = await generatePDF()
      
      // Создаем File объект для отправки
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' })

      // Подготавливаем текст для шаринга
      const shareText = `🏠 Оценка недвижимости\n\n${result.address}\n\n💰 Средняя цена: ${result.price} ₽\n📊 За м²: ${result.priceMeter} ₽\n📉 Мин: ${result.priceMin} ₽\n📈 Макс: ${result.priceMax} ₽\n\n📅 Изменение за год: ${result.annualPriceChangePercent > 0 ? '+' : ''}${result.annualPriceChangePercent.toFixed(2)}%\n📅 Изменение за 3 месяца: ${result.threeMonthPriceChangePercent > 0 ? '+' : ''}${result.threeMonthPriceChangePercent.toFixed(2)}%\n\n📱 MurmanClick - Оценка недвижимости Мурманска`

      // Приоритет 1: Пробуем использовать Web Share API с файлом PDF
      const canShareFile = navigator.share && 
                          navigator.canShare && 
                          typeof navigator.canShare === 'function' &&
                          navigator.canShare({ files: [pdfFile] })

      if (canShareFile) {
        try {
          await navigator.share({
            title: 'Оценка недвижимости - MurmanClick',
            text: `Отчет об оценке недвижимости: ${result.address}`,
            files: [pdfFile]
          })
          setShareSuccess(true)
          setTimeout(() => setShareSuccess(false), 3000)
          return
        } catch (shareError) {
          if (shareError.name === 'AbortError') {
            setIsGeneratingPDF(false)
            return
          }
          console.log('Web Share API с файлом не сработал, пробуем другие варианты:', shareError)
        }
      }

      // Приоритет 2: Пробуем использовать Web Share API с текстом + скачиваем PDF
      if (navigator.share) {
        try {
          // Сначала скачиваем PDF
          const url = URL.createObjectURL(pdfBlob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          
          // Затем предлагаем поделиться текстом
          await navigator.share({
            title: 'Оценка недвижимости - MurmanClick',
            text: shareText,
          })
          
          setShareSuccess(true)
          setTimeout(() => setShareSuccess(false), 3000)
          return
        } catch (shareError) {
          if (shareError.name === 'AbortError') {
            setShareSuccess(true)
            setTimeout(() => setShareSuccess(false), 3000)
            return
          }
          console.log('Web Share API с текстом не сработал:', shareError)
        }
      }

      // Приоритет 3: Telegram Web App Share
      if (window.Telegram?.WebApp?.shareUrl) {
        try {
          // Скачиваем PDF
          const url = URL.createObjectURL(pdfBlob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          
          // Затем предлагаем поделиться текстом через Telegram
          window.Telegram.WebApp.shareUrl(window.location.href, shareText)
          
          setShareSuccess(true)
          setTimeout(() => setShareSuccess(false), 3000)
          return
        } catch (telegramError) {
          console.log('Telegram Web App Share не сработал:', telegramError)
        }
      }

      // Приоритет 4: Fallback - копируем текст и скачиваем PDF
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareText)
        }
        
        // Скачиваем PDF
        const url = URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 3000)
      } catch (fallbackErr) {
        console.error('Ошибка при fallback шаринге:', fallbackErr)
        // В крайнем случае просто скачиваем PDF
        const url = URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 3000)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Ошибка при генерации/отправке PDF:', err)
        setShareSuccess(false)
      }
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (!result) {
    return (
      <div className="results-empty">
        <p>Данные не найдены</p>
      </div>
    )
  }

  const priceChangeColor = result.annualPriceChangePercent >= 0 ? 'var(--success)' : 'var(--error)'
  const threeMonthChangeColor = result.threeMonthPriceChangePercent >= 0 ? 'var(--success)' : 'var(--error)'

  return (
    <div className="results">
      <div className="results-header">
        <h2>Результаты оценки</h2>
        <button 
          className="share-button"
          onClick={handleShare}
          title="Поделиться отчетом (PDF)"
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinning">
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" strokeLinecap="round">
                </circle>
              </svg>
              <span>Генерация PDF...</span>
            </>
          ) : shareSuccess ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Отправлено!</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <span>Поделиться</span>
            </>
          )}
        </button>
      </div>

      <div className="result-card address-card">
        <div className="card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div className="card-content">
          <p className="address-text">{result.address}</p>
        </div>
      </div>

      <div className="result-card price-card">
        <div className="card-header">
          <div className="card-header-left">
            <div className="card-icon">
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>₽</span>
            </div>
            <h3>Средняя цена</h3>
          </div>
        </div>
        <div className="card-content">
          <div className="price-main">
            <span className="price-value">{result.price} ₽</span>
          </div>
          <div className="price-details">
            <div className="price-item">
              <span className="price-item-label">За м²</span>
              <span className="price-item-value">{result.priceMeter} ₽</span>
            </div>
            <div className="price-range">
              <div className="price-item">
                <span className="price-item-label">
                  Мин
                  <button 
                    className="tooltip-trigger"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMinTooltip(!showMinTooltip)
                      setShowMaxTooltip(false)
                    }}
                    aria-label="Подсказка"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </button>
                  {showMinTooltip && (
                    <div className="tooltip">
                      Минимальная стоимость объекта на рынке недвижимости за 6 мес
                    </div>
                  )}
                </span>
                <span className="price-item-value">{result.priceMin} ₽</span>
              </div>
              <div className="price-item">
                <span className="price-item-label">
                  Макс
                  <button 
                    className="tooltip-trigger"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMaxTooltip(!showMaxTooltip)
                      setShowMinTooltip(false)
                    }}
                    aria-label="Подсказка"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </button>
                  {showMaxTooltip && (
                    <div className="tooltip">
                      Максимальная стоимость объекта на рынке недвижимости за 6 месяцев
                    </div>
                  )}
                </span>
                <span className="price-item-value">{result.priceMax} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    

      <div className="result-card stats-card">
        <div className="card-header">
          <div className="card-header-left">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <h3>Изменение цены</h3>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">За год</span>
            <span 
              className="stat-value" 
              style={{ color: priceChangeColor }}
            >
              {result.annualPriceChangePercent > 0 ? '+' : ''}
              {result.annualPriceChangePercent.toFixed(2)}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">За 3 месяца</span>
            <span 
              className="stat-value" 
              style={{ color: threeMonthChangeColor }}
            >
              {result.threeMonthPriceChangePercent > 0 ? '+' : ''}
              {result.threeMonthPriceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
      {chartData.length > 0 && (
        <>
          <div className="result-card chart-card">
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 6 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 6 22 6 22 12"></polyline>
                  </svg>
                </div>
                <h3>Динамика изменения цены</h3>
              </div>
              <button 
                className="chart-expand-button"
                onClick={() => setChartExpanded(true)}
                title="Увеличить график"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>
              </button>
            </div>
            <div className="chart-container" ref={chartContainerRef}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--text-secondary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}М`}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      border: `1px solid var(--border)`,
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      padding: '8px 12px',
                    }}
                    formatter={(value) => formatPrice(value)}
                    labelStyle={{ color: 'var(--text-primary)', marginBottom: '4px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="var(--accent)"
                    strokeWidth={2.5}
                    dot={{ fill: 'var(--accent)', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-disclaimer">
              <div className="disclaimer-header">
                <div className="disclaimer-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <h4 className="disclaimer-title">Источник данных</h4>
              </div>
              <div className="disclaimer-content">
                <p>
                  Данные собраны из открытых источников и носят информационный характер. 
                  Оценка основана на анализе объявлений о продаже недвижимости и может отличаться 
                  от реальной рыночной стоимости.
                </p>
              </div>
              <button 
                className="consultation-button"
                onClick={() => {
                  // Открываем Telegram для консультации
                  if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.openTelegramLink('https://t.me/egor_018')
                  } else {
                    window.open('https://t.me/egor_018', '_blank')
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <line x1="9" y1="10" x2="15" y2="10"></line>
                  <line x1="12" y1="7" x2="12" y2="13"></line>
                </svg>
                <span>Получить консультацию по оценке</span>
              </button>
            </div>
          </div>

          {chartExpanded && (
            <div className="chart-modal" onClick={() => setChartExpanded(false)}>
              <div className="chart-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="chart-modal-header">
                  <h3>Динамика изменения цены</h3>
                  <button 
                    className="chart-modal-close"
                    onClick={() => setChartExpanded(false)}
                    aria-label="Закрыть"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="chart-modal-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="var(--text-secondary)"
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis 
                        stroke="var(--text-secondary)"
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}М ₽`}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card-bg)',
                          border: `1px solid var(--border)`,
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          padding: '10px 14px',
                        }}
                        formatter={(value) => formatPrice(value)}
                        labelStyle={{ color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 600 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="var(--accent)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--accent)', r: 4 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Results


