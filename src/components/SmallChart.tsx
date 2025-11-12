import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function SmallChart({ labels, data }: { labels: string[]; data: number[] }) {
  const chartData = {
    labels,
    datasets: [{
      label: 'Notas',
      data,
      fill: false,
      borderColor: '#0a9396'
    }]
  }
  return <Line data={chartData} />
}
