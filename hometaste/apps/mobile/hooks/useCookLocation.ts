import * as Location from "expo-location";
import { apiRequest } from "../services/api";

/**
 * Updates a cook profile with approximate current location.
 */
export function useCookLocation() {
  async function updateCookLocation(cookId: string): Promise<void> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("Location permission denied for cook profile");
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });
    const [geocode] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });

    await apiRequest(`/api/cooks/${cookId}/location`, {
      auth: true,
      method: "PATCH",
      body: JSON.stringify({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        city: geocode?.city ?? geocode?.subregion ?? "",
        area: geocode?.district ?? geocode?.street ?? ""
      })
    });
  }

  return { updateCookLocation };
}
