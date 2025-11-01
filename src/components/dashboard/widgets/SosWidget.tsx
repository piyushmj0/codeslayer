"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { triggerSos } from "@/services/alertService";
import { Card, CardContent } from "@/components/ui/card";
import { Siren, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const SosWidget = () => {
    const [status, setStatus] = useState<'idle' | 'holding' | 'sending' | 'sent'>('idle');
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleSosTrigger = () => {
        setStatus('sending');
        toast.info("Getting your location...");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                toast.promise(triggerSos(latitude, longitude), {
                    loading: 'Sending SOS to contacts and authorities...',
                    success: () => {
                        setStatus('sent');
                        return "Alert sent successfully!";
                    },
                    error: (err) => {
                        setStatus('idle');
                        return err.response?.data?.message || "Failed to send alert.";
                    }
                });
            },
            () => {
                toast.error("Could not get location. Please enable location services.");
                setStatus('idle');
            }
        );
    };

    const handlePressStart = () => {
        if (status !== 'idle') return;
        setStatus('holding');
        timerRef.current = setTimeout(handleSosTrigger, 3000); // 3-second hold
    };

    const handlePressEnd = () => {
        if (status !== 'holding') return;
        setStatus('idle');
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };

    if (status === 'sent') {
        return (
            <Card className="bg-green-600 text-white flex flex-col items-center justify-center text-center p-6 h-full">
                <CheckCircle className="h-10 w-10 mb-2"/>
                <h3 className="text-lg font-bold">Alert Sent</h3>
                <p className="text-sm text-green-100">Help is on the way.</p>
            </Card>
        );
    }
  
    return (
        <Card className="bg-red-500 text-white h-full">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center h-full">
                <h3 className="text-lg font-bold">Emergency SOS</h3>
                <p className="text-sm text-red-100 mb-4">Press & Hold for 3 seconds</p>
                <motion.button
                    onMouseDown={handlePressStart}
                    onMouseUp={handlePressEnd}
                    onTouchStart={handlePressStart}
                    onTouchEnd={handlePressEnd}
                    disabled={status === 'sending'}
                    className="relative w-24 h-24 rounded-full bg-white/20 flex items-center justify-center shadow-lg transition-transform transform active:scale-95 disabled:opacity-50"
                >
                    <AnimatePresence>
                    {status === 'holding' && (
                        <motion.div
                            className="absolute inset-0 bg-white/40 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 3, ease: "linear" }}
                        />
                    )}
                    </AnimatePresence>
                    <Siren className="w-10 h-10 text-white" />
                </motion.button>
            </CardContent>
        </Card>
    );
};