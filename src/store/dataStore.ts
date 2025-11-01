import { create } from "zustand";
import {
  Itinerary,
  Group,
  SafetyZone,
  GroupMemberLocation,
  NearbyTourist,
  GroupInvite,
  DashboardAlert,
} from "@/types";
import { FeatureCollection } from "geojson";
import { getItinerary } from "@/services/itineraryService";
import {
  getMyGroups,
  getGroupMemberLocations,
  getPendingInvites,
} from "@/services/groupService";
import { getSafetyZones, getSafeSpots } from "@/services/zonesService";
import { getNearbyTourists } from "@/services/locationService";
import { getMyDashboardAlerts } from "@/services/alertService";

// Define the state structure
interface DataState {
  itinerary: Itinerary | null;
  groups: Group[];
  invites: GroupInvite[];
  alerts: DashboardAlert[];
  safetyZones: FeatureCollection | null;
  safeSpots: FeatureCollection | null;
  groupMemberLocations: FeatureCollection | null;
  nearbyTourists: FeatureCollection | null;
  isLoading: boolean;
  fetchInitialData: (location: {
    latitude: number;
    longitude: number;
  }) => Promise<void>;
  fetchItinerary: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  fetchInvites: () => Promise<void>;
  fetchGroupsAndInvites: () => Promise<void>;
}

const createGroupLocationFC = (
  locations: GroupMemberLocation[]
): FeatureCollection => {
  const features = locations.map((member: GroupMemberLocation) => ({
    type: "Feature" as const,

    geometry: {
      type: "Point" as const,
      coordinates: [member.longitude, member.latitude],
    },

    properties: {
      name: member.user.name || "Group Member",

      phone: member.user.phoneNumber,

      type: "Group Member",
    },
  }));

  return { type: "FeatureCollection", features };
};

const createZoneFC = (zones: SafetyZone[]): FeatureCollection => {
  const features = zones.map((zone) => ({
    type: "Feature" as const,

    id: zone.id,

    geometry: zone.geometry,

    properties: {
      safetyScore: zone.safetyScore,
      name: zone.name,
      type: zone.type,
    },
  }));

  return { type: "FeatureCollection", features };
};

const createNearbyTouristFC = (
  tourists: NearbyTourist[]
): FeatureCollection => {
  const features = tourists.map((tourist: NearbyTourist) => ({
    type: "Feature" as const,

    geometry: {
      type: "Point" as const,
      coordinates: [tourist.longitude, tourist.latitude],
    },

    properties: {
      name: `Tourist: ${tourist.uniqueDigitalId}`,

      phone: tourist.user.phoneNumber,

      type: "Nearby Tourist",
    },
  }));

  return { type: "FeatureCollection", features };
};

export const useDataStore = create<DataState>((set, get) => ({
  itinerary: null,
  groups: [],
  invites: [],
  alerts: [],
  safetyZones: null,
  safeSpots: null,
  groupMemberLocations: null,
  nearbyTourists: null,
  isLoading: true,

  fetchInitialData: async (location) => {
    set({ isLoading: true });
    try {
      // Fetch data in parallel
      const results = await Promise.allSettled([
        getItinerary(),
        getMyGroups(),
        getSafetyZones(),
        getSafeSpots(),
        getNearbyTourists(location.latitude, location.longitude),
        getPendingInvites(),
        getMyDashboardAlerts(),
      ]);

      const itineraryRes = results[0].status === 'fulfilled' ? results[0].value.data : null;
      const groupsRes = results[1].status === 'fulfilled' ? results[1].value.data : [];
      const zonesRes = results[2].status === 'fulfilled' ? results[2].value.data : [];
      const spotsRes = results[3].status === 'fulfilled' ? results[3].value.data : null;
      const nearbyTouristsRes = results[4].status === 'fulfilled' ? results[4].value.data : [];
      const invitesRes = results[5].status === 'fulfilled' ? results[5].value.data : [];
      const alertsRes = results[6].status === 'fulfilled' ? results[6].value.data : [];

      set({
        itinerary: itineraryRes,
        groups: groupsRes,
        invites: invitesRes,
        alerts: alertsRes,
        safetyZones: createZoneFC(zonesRes),
        safeSpots: spotsRes,
        nearbyTourists: createNearbyTouristFC(nearbyTouristsRes),
      });

      if (groupsRes.length > 0) {
        const groupLocationResults = await Promise.all(groupsRes.map(g => getGroupMemberLocations(g.id)));
        const allMembers = groupLocationResults.flatMap(res => res.data);
        set({ groupMemberLocations: createGroupLocationFC(allMembers) });
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchItinerary: async () => {
    try {
      const res = await getItinerary();
      set({ itinerary: res.data });
    } catch (error) {
      console.error("Failed to re-fetch itinerary:", error);
    }
  },

  fetchGroups: async () => {
    try {
      const res = await getMyGroups();
      const groups = res.data;
      set({ groups: groups });

      if (groups.length > 0) {
        const groupLocationResults = await Promise.all(
          groups.map((g) => getGroupMemberLocations(g.id))
        );
        const allMembers = groupLocationResults.flatMap((res) => res.data);
        set({ groupMemberLocations: createGroupLocationFC(allMembers) });
      } else {
        set({ groupMemberLocations: null });
      }
    } catch (error) {
      console.error("Failed to re-fetch groups:", error);
    }
  },

  fetchInvites: async () => {
    try {
      const res = await getPendingInvites();
      set({ invites: res.data });
    } catch (error) {
      console.error("Failed to re-fetch invites:", error);
    }
  },

  fetchGroupsAndInvites: async () => {
    await get().fetchGroups();
    await get().fetchInvites();
  },
}));
