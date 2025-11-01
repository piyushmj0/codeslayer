"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SafetyHeatmap = ({ className = "" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);

    const canvas = canvasRef.current;
    if (!canvas || isLoading) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const drawHotspot = (x: number, y: number, radius: number, color: string) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);

      // FIX: Create a valid transparent color by replacing the alpha value with 0.
      const transparentColor = color.replace(/, [\d.]+\)$/, ', 0)');
      gradient.addColorStop(1, transparentColor);
      
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw hotspots
    drawHotspot(canvas.width * 0.25, canvas.height * 0.6, 120, 'rgba(46, 204, 113, 0.4)'); // Green
    drawHotspot(canvas.width * 0.7, canvas.height * 0.75, 100, 'rgba(46, 204, 113, 0.3)');// Green
    drawHotspot(canvas.width * 0.5, canvas.height * 0.3, 150, 'rgba(241, 196, 15, 0.3)');// Yellow
    drawHotspot(canvas.width * 0.8, canvas.height * 0.2, 130, 'rgba(231, 76, 60, 0.4)'); // Red

    return () => clearTimeout(timer);
  }, [isLoading]);
  
  if (isLoading) {
    return <Skeleton className={cn("w-full h-full", className)} />;
  }

  return (
    <Card className={cn("relative w-full h-full overflow-hidden shadow-2xl bg-slate-900", className)}>
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/77.20,28.61,12/600x400?access_token=pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2p0MG01MXRqMW45cjQzb2R6b2ptc3J4MSJ9.zA2W0IkI0c6KaAhJfk9bWg')" }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-4 right-4">
        <Badge variant="destructive" className="animate-pulse">
          ● LIVE
        </Badge>
      </div>
       <div className="absolute bottom-4 left-4 p-2 bg-black/50 rounded-lg">
          <p className="text-white font-bold text-lg">Central Delhi</p>
          <p className="text-slate-300 text-sm">Safety Analysis</p>
       </div>
    </Card>
  );
};

export default SafetyHeatmap;