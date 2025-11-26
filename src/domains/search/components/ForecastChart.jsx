import { useMemo, memo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { formatPrice, formatDate } from '../../../shared/utils/formatters'
import './ForecastChart.css'

const ForecastChart = memo(({ historical, forecast }) => {
  // Мемоизация данных графика для оптимизации производительности
  const chartData = useMemo(() => {
    if (!historical || !forecast || historical.length === 0 || forecast.length === 0) {
      return null
    }
    
    // Подготавливаем исторические данные
    const historicalData = historical.map(item => ({
      ...item,
      isForecast: false
    }))
    
    // Подготавливаем данные прогноза с соединением с последней точкой истории
    const lastHistorical = historical[historical.length - 1]
    const forecastData = [
      {
        date: lastHistorical.date,
        price: lastHistorical.price,
        isForecast: false
      },
      ...forecast.map(item => ({
        ...item,
        isForecast: true
      }))
    ]
    
    // Объединяем все данные для графика
    return [...historicalData, ...forecast]
  }, [historical, forecast])

  // Мемоизация диапазона для оси Y
  const yAxisDomain = useMemo(() => {
    if (!historical || !forecast || historical.length === 0 || forecast.length === 0) {
      return ['auto', 'auto']
    }
    
    const allPrices = [...historical.map(d => d.price), ...forecast.map(d => d.price)]
    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices)
    const range = maxPrice - minPrice
    const padding = range * 0.2
    return [Math.max(0, minPrice - padding), maxPrice + padding]
  }, [historical, forecast])

  // Мемоизация исторических данных
  const historicalData = useMemo(() => {
    if (!historical || historical.length === 0) {
      return []
    }
    return historical.map(item => ({
      ...item,
      isForecast: false
    }))
  }, [historical])

  // Мемоизация данных прогноза
  const forecastData = useMemo(() => {
    if (!historical || !forecast || historical.length === 0 || forecast.length === 0) {
      return []
    }
    const lastHistorical = historical[historical.length - 1]
    return [
      {
        date: lastHistorical.date,
        price: lastHistorical.price,
        isForecast: false
      },
      ...forecast.map(item => ({
        ...item,
        isForecast: true
      }))
    ]
  }, [historical, forecast])

  if (!chartData) {
    return null
  }
  
  // Находим дату разделения истории и прогноза
  const lastHistoricalDate = historical[historical.length - 1].date
  
  return (
    <div className="forecast-chart-container">
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
            tickFormatter={formatDate}
          />
          <YAxis 
            stroke="var(--text-secondary)"
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}М`}
            width={50}
            domain={yAxisDomain}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            formatter={(value, name, props) => {
              const isForecast = props.payload?.isForecast
              const period = props.payload?.period
              const label = isForecast ? (period ? `Прогноз (${period})` : 'Прогноз') : 'История'
              return [formatPrice(value, { showCurrency: false }), label]
            }}
            labelStyle={{ color: 'var(--text-primary)', marginBottom: '4px' }}
            labelFormatter={(value) => formatDate(value)}
          />
          
          {/* Линия разделения истории и прогноза */}
          <ReferenceLine 
            x={lastHistoricalDate} 
            stroke="var(--text-secondary)" 
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ 
              value: "Начало прогноза", 
              position: "top",
              fill: 'var(--text-secondary)',
              fontSize: 10
            }}
          />
          
          {/* Исторические данные - синяя линия */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 5 }}
            data={historicalData}
            connectNulls
            isAnimationActive={false}
          />
          
          {/* Прогноз - красная линия */}
          <Line
            type="monotone"
            dataKey="price"
            stroke="#ef4444"
            strokeWidth={2.5}
            strokeDasharray="8 4"
            dot={{ fill: '#ef4444', r: 4, opacity: 0.8 }}
            activeDot={{ r: 6 }}
            data={forecastData}
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
})

ForecastChart.displayName = 'ForecastChart'

export default ForecastChart

