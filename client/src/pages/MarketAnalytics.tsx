import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface MarketAnalyticsProps {
  propertiesByType: Array<{ type: string; count: number }>
  priceDistribution: Array<{ range: string; count: number }>
}

const MarketAnalytics: React.FC<MarketAnalyticsProps> = ({
  propertiesByType,
  priceDistribution
}) => {
  const typeData = {
    labels: propertiesByType.map(item => item.type),
    datasets: [
      {
        label: 'Properties by Type',
        data: propertiesByType.map(item => item.count),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  }

  const priceData = {
    labels: priceDistribution.map(item => item.range),
    datasets: [
      {
        label: 'Properties by Price Range',
        data: priceDistribution.map(item => item.count),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Market Analytics</h2>
      
      <div className="mb-8">
        <h3 className="font-medium mb-2">Properties by Type</h3>
        <Bar data={typeData} />
      </div>
      
      <div>
        <h3 className="font-medium mb-2">Price Distribution</h3>
        <Bar data={priceData} />
      </div>
    </div>
  )
}

export default MarketAnalytics
