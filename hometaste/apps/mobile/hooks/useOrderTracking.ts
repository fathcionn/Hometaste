import type { Order, OrderStatus } from "@hometaste/types";
import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { getSocket } from "../services/socket";

interface StatusEvent {
  orderId: string;
  status: OrderStatus;
  timestamp: string;
}

interface LocationEvent {
  lat: number;
  lng: number;
}

export function useOrderTracking(orderId: string) {
  const queryClient = useQueryClient();
  const [courierLocation, setCourierLocation] = useState<LocationEvent | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join:order", orderId);
    socket.on("order:status_updated", (data: StatusEvent) => {
      queryClient.setQueryData<Order>(["order", orderId], (old) => old
        ? {
            ...old,
            status: data.status,
            statusHistory: [...old.statusHistory, { id: `${data.status}-${data.timestamp}`, orderId, status: data.status, createdAt: data.timestamp }]
          }
        : old);
      void Notifications.scheduleNotificationAsync({
        content: { title: "Order update", body: data.status },
        trigger: null
      });
    });
    socket.on("order:location_updated", (data: LocationEvent) => setCourierLocation(data));

    return () => {
      socket.emit("leave:order", orderId);
      socket.off("order:status_updated");
      socket.off("order:location_updated");
    };
  }, [orderId, queryClient]);

  return { courierLocation };
}
