"use client";

import { useState } from "react";
import { toast } from "sonner";
import { pauseTracking } from "@/services/tripService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CheckInDialog = ({ open, onOpenChange }: CheckInDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState("1");
  const [isCustom, setIsCustom] = useState(false);
  const [customHours, setCustomHours] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    const finalDuration = isCustom ? Number(customHours) : Number(duration);

    if (!finalDuration || finalDuration <= 0) {
      toast.error("Please enter a valid number of hours.");
      setLoading(false);
      return;
    }

    toast.promise(pauseTracking(finalDuration), {
      loading: "Pausing your location tracking...",
      success: () => {
        setLoading(false);
        onOpenChange(false);
        return `Tracking paused for ${finalDuration} hour(s). Stay safe!`;
      },
      error: (err) => {
        setLoading(false);
        return err.response?.data?.message || "Failed to pause tracking.";
      },
    });
  };

  const handleSelectChange = (value: string) => {
    if (value === "custom") {
      setIsCustom(true);
      setDuration("custom");
    } else {
      setIsCustom(false);
      setDuration(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Safe Check-in</DialogTitle>
          <DialogDescription>
            Arrived at your hotel or a safe spot for a while? Pause anomaly
            detection to prevent false alerts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Pause Duration</Label>
            <Select onValueChange={handleSelectChange} defaultValue={duration}>
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select a duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Hour</SelectItem>
                <SelectItem value="2">2 Hours</SelectItem>
                <SelectItem value="4">4 Hours</SelectItem>
                <SelectItem value="8">8 Hours (Sleeping)</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {isCustom && (
              <div className="mt-2">
                <Label htmlFor="customHours">Custom Hours</Label>
                <Input
                  id="customHours"
                  type="number"
                  min={0.5}
                  step={0.5}
                  placeholder="Enter number of hours"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Check-in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
