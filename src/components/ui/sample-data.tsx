import { Card, CardContent } from './card';
import { Progress } from './progress';

// Sample prayer schedule for empty state
export function SamplePrayerSchedule() {
  const prayers = [
    { name: 'Fajr', time: '5:23 AM', completed: true },
    { name: 'Dhuhr', time: '1:15 PM', completed: true },
    { name: 'Asr', time: '4:45 PM', completed: false },
    { name: 'Maghrib', time: '7:32 PM', completed: false },
    { name: 'Isha', time: '9:05 PM', completed: false },
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h4 className="text-sm font-medium mb-3">Sample Prayer Schedule</h4>
        <div className="space-y-3">
          {prayers.map((prayer) => (
            <div key={prayer.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${prayer.completed ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                <span className="text-sm">{prayer.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{prayer.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Sample insights for empty state
export function SampleInsights() {
  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <h4 className="text-sm font-medium">Sample Weekly Consistency</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs">Fajr</span>
            <span className="text-xs text-muted-foreground">71%</span>
          </div>
          <Progress value={71} className="h-1" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs">Dhuhr</span>
            <span className="text-xs text-muted-foreground">86%</span>
          </div>
          <Progress value={86} className="h-1" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs">Asr</span>
            <span className="text-xs text-muted-foreground">57%</span>
          </div>
          <Progress value={57} className="h-1" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs">Maghrib</span>
            <span className="text-xs text-muted-foreground">93%</span>
          </div>
          <Progress value={93} className="h-1" />
          
          <div className="flex items-center justify-between">
            <span className="text-xs">Isha</span>
            <span className="text-xs text-muted-foreground">79%</span>
          </div>
          <Progress value={79} className="h-1" />
        </div>
      </CardContent>
    </Card>
  );
}

// Sample calendar for empty state
export function SampleCalendar() {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h4 className="text-sm font-medium mb-3">Sample Monthly View</h4>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 30 }).map((_, i) => {
            // Generate some random sample data
            const completed = Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : 0;
            const total = 5;
            const percentage = (completed / total) * 100;
            
            return (
              <div 
                key={i} 
                className={`aspect-square rounded-sm flex items-center justify-center text-xs
                  ${percentage === 0 ? 'bg-muted' : 
                    percentage < 50 ? 'bg-primary/30' : 
                    percentage < 100 ? 'bg-primary/60' : 'bg-primary'}`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
