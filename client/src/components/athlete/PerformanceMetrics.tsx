import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gauge, Dumbbell, Heart, Target, TrendingUp } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PerformanceMetrics() {
  const { userProfile } = useUser();

  if (!userProfile?.metrics) return null;

  const metrics = userProfile.metrics as any;
  const speed = metrics.speed || 0;
  const strength = metrics.strength || 0;
  const stamina = metrics.stamina || 0;
  const technique = metrics.technique || 0;

  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Speed',
        data: [speed - 1, speed - 0.5, speed - 0.2, speed],
        borderColor: 'hsl(221.2, 83.2%, 53.3%)',
        backgroundColor: 'hsla(221.2, 83.2%, 53.3%, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Strength',
        data: [strength - 0.8, strength - 0.4, strength - 0.1, strength],
        borderColor: 'hsl(24.6, 95%, 53.1%)',
        backgroundColor: 'hsla(24.6, 95%, 53.1%, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Stamina',
        data: [stamina - 0.6, stamina - 0.3, stamina - 0.1, stamina],
        borderColor: 'hsl(142.1, 76.2%, 36.3%)',
        backgroundColor: 'hsla(142.1, 76.2%, 36.3%, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Technique',
        data: [technique - 0.5, technique - 0.2, technique, technique + 0.1],
        borderColor: 'hsl(280, 100%, 70%)',
        backgroundColor: 'hsla(280, 100%, 70%, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
  };

  return (
    <Card className="lg:col-span-2 card-hover" data-testid="card-performance-metrics">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance Metrics</CardTitle>
          <Select defaultValue="30days">
            <SelectTrigger className="w-40" data-testid="select-time-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="1year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-chart-1/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Gauge className="text-chart-1 h-8 w-8" />
            </div>
            <div className="text-2xl font-bold text-card-foreground" data-testid="metric-speed">
              {speed.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Speed</div>
            <div className="text-xs text-accent">+5% ↗</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Dumbbell className="text-chart-2 h-8 w-8" />
            </div>
            <div className="text-2xl font-bold text-card-foreground" data-testid="metric-strength">
              {strength.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Strength</div>
            <div className="text-xs text-accent">+12% ↗</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-chart-3/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="text-chart-3 h-8 w-8" />
            </div>
            <div className="text-2xl font-bold text-card-foreground" data-testid="metric-stamina">
              {stamina.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Stamina</div>
            <div className="text-xs text-accent">+8% ↗</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-chart-4/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="text-chart-4 h-8 w-8" />
            </div>
            <div className="text-2xl font-bold text-card-foreground" data-testid="metric-technique">
              {technique.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Technique</div>
            <div className="text-xs text-accent">+3% ↗</div>
          </div>
        </div>
        
        {/* Performance Chart */}
        <div className="h-48" data-testid="chart-performance">
          <Line data={chartData} options={chartOptions} />
        </div>
      </CardContent>
    </Card>
  );
}
