"use client";
import { ItineraryPlace } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export const ItineraryWidget = ({ places }: { places: ItineraryPlace[] }) => (
    <Link href="/dashboard/itinerary">
        <Card className="backdrop-blur-lg bg-transparent border border-white/20">
            <CardHeader>
                <CardTitle className="text-white">Upcoming Itinerary</CardTitle>
                <CardDescription className=" text-white/40">Your next few stops.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {places.length > 0 ? (
                    places.slice(0, 3).map(place => (
                        <div key={place.id} className="flex items-center">
                            <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="font-semibold">{place.name}</p>
                                <p className="text-sm text-white/40">{format(new Date(place.date), "PPP")}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-white/40">No stops added yet.</p>
                )}
                <div className="flex items-center justify-end text-sm font-semibold text-white/40">
                    View Full Itinerary <ArrowRight className="h-4 w-4 ml-2" />
                </div>
            </CardContent>
        </Card>
    </Link>
);