import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Target, Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsGridProps {
  unitCount: number;
  progressPercentage: number;
  totalXp: number;
  className?: string;
}

export const StatsGrid = ({ unitCount, progressPercentage, totalXp, className }: StatsGridProps) => {
  const stats = [
    {
      title: "Các đơn vị học",
      value: unitCount.toString(),
      icon: BookOpen,
      trend: "+1 tuần này",
    },
    {
      title: "Tiến độ hoàn thành",
      value: `${progressPercentage}%`,
      icon: Target,
      trend: "+5% hôm nay",
    },
    {
      title: "Tổng điểm XP",
      value: totalXp.toLocaleString(),
      icon: Trophy,
      trend: "+120 XP",
    },
  ];

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6 mb-12", className)}>
      {stats.map((stat, index) => (
        <Card key={index} className="group border shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 cursor-pointer overflow-hidden relative">
          <div className="absolute inset-0 bg-muted/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-foreground group-hover:scale-105 transition-transform duration-300">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                <stat.icon className="w-8 h-8 text-foreground group-hover:animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 