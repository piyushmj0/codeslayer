"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlaceFormData, placeSchema } from "@/types";
import {
  createItinerary,
  addPlace,
  deletePlace,
} from "@/services/itineraryService";
import { getRoutesForItinerary, ItineraryRoute } from "@/services/routeService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import MapComponent from "@/components/map/Map";
import { useDataStore } from "@/store/dataStore";

// --- Sub-component for the "Add Place" Form Dialog ---
const AddPlaceForm = ({
  onFormSubmit,
  initialCoords,
  open,
  onOpenChange,
}: {
  onFormSubmit: () => void;
  initialCoords?: { lat: number; lng: number } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const form = useForm<PlaceFormData>({
    resolver: zodResolver(placeSchema),
    defaultValues: { name: "", notes: "" },
  });

  useEffect(() => {
    if (initialCoords) {
      form.setValue("latitude", initialCoords.lat);
      form.setValue("longitude", initialCoords.lng);
      // Reset other fields when new coords are passed
      form.resetField("name");
      form.resetField("date");
      form.resetField("notes");
    }
  }, [initialCoords, form]);

  const onSubmit = async (data: PlaceFormData) => {
    toast.promise(addPlace(data), {
      loading: "Saving new stop...",
      success: () => {
        onFormSubmit();
        onOpenChange(false);
        form.reset();
        return "New stop added!";
      },
      error: (err) => err.response?.data?.message || "Failed to add place.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a New Stop</DialogTitle>
          <DialogDescription>
            Fill in the details for the stop you selected on the map.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Place Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., India Gate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="date"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="notes"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Entry times" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <input type="hidden" {...form.register("latitude")} />
            <input type="hidden" {...form.register("longitude")} />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Stop</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// --- Sub-component for the "Create Itinerary" Form ---
const CreateItineraryForm = ({
  onItineraryCreated,
}: {
  onItineraryCreated: () => void;
}) => {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Please give your itinerary a name.");
      return;
    }
    toast.promise(createItinerary({ name }), {
      loading: "Creating itinerary...",
      success: () => {
        onItineraryCreated();
        return "Itinerary created successfully!";
      },
      error: (err) => err.message,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Trip Itinerary</CardTitle>
        <CardDescription>
          Give your travel plan a name to get started. You can add stops next.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Label htmlFor="itineraryName">Itinerary Name</Label>
          <Input
            id="itineraryName"
            placeholder="e.g., My Rajasthan Adventure"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" className="mt-2">
            Create Plan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// --- Main Itinerary Page Component ---
export default function ItineraryPage() {
  const itinerary = useDataStore((state) => state.itinerary);
  const isLoading = useDataStore((state) => state.isLoading);
  const fetchItinerary = useDataStore((state) => state.fetchItinerary);

  const [itineraryRoutes, setItineraryRoutes] = useState<
    (ItineraryRoute | null)[]
  >([]);
  const [mapClickCoords, setMapClickCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (itinerary && itinerary.places.length > 1) {
      getRoutesForItinerary(itinerary.places)
        .then((res) => setItineraryRoutes(res.data))
        .catch(() => toast.error("Could not calculate itinerary routes."));
    }
  }, [itinerary]);

  const handleDeletePlace = async (placeId: string) => {
    toast.promise(deletePlace(placeId), {
      loading: "Deleting stop...",
      success: () => {
        fetchItinerary();
        return "Stop removed from your itinerary.";
      },
      error: "Failed to delete stop.",
    });
  };

  const handleMapClick = (coords: { lat: number; lng: number }) => {
    setMapClickCoords(coords);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-2 gap-6 h-full">
        <Skeleton className="h-[calc(100vh-10rem)] min-h-[500px]" />
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return !itinerary ? (
    <CreateItineraryForm onItineraryCreated={fetchItinerary} />
  ) : (
    <>
      <AddPlaceForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onFormSubmit={fetchItinerary}
        initialCoords={mapClickCoords}
      />
      <div className="grid lg:grid-cols-2 gap-6 h-full">
        <div className="h-[calc(100vh-10rem)] min-h-[500px] rounded-lg overflow-hidden border">
          <MapComponent
            onMapClickCoords={handleMapClick}
            path={itinerary?.places}
            routes={itineraryRoutes}
            initialCenter={
              itinerary.places.length > 0
                ? {
                    lat: itinerary.places[0].latitude!,
                    lng: itinerary.places[0].longitude!,
                  }
                : undefined
            }
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {itinerary.name}
            </h1>
            <p className="text-muted-foreground">
              Click on the map to add a new stop to your plan.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Planned Stops</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Place</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itinerary.places.length > 0 ? (
                    itinerary.places.map((place) => (
                      <TableRow key={place.id}>
                        <TableCell>
                          {format(new Date(place.date), "PPP")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {place.name}
                        </TableCell>
                        <TableCell>{place.notes}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePlace(place.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        No stops added yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
