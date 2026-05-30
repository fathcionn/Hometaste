import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { logger } from "../config/logger.js";

const expo = new Expo({
  ...(process.env.EXPO_ACCESS_TOKEN ? { accessToken: process.env.EXPO_ACCESS_TOKEN } : {})
});

export async function sendPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (!Expo.isExpoPushToken(pushToken)) {
    logger.warn(`Invalid Expo push token: ${pushToken}`);
    return;
  }

  const message: ExpoPushMessage = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data: data ?? {},
    badge: 1,
  };

  const chunks = expo.chunkPushNotifications([message]);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
      logger.info(`Push notification sent to ${pushToken}: ${title}`);
    } catch (err) {
      logger.error(`Push notification error for ${pushToken}:`, err);
    }
  }
}

export async function sendBulkPushNotifications(
  pushTokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const validTokens = pushTokens.filter((token) =>
    Expo.isExpoPushToken(token)
  );

  if (validTokens.length === 0) {
    logger.warn("No valid push tokens provided");
    return;
  }

  const messages: ExpoPushMessage[] = validTokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body,
    data: data ?? {},
    badge: 1,
  }));

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
      logger.info(
        `Bulk push notifications sent to ${chunk.length} users: ${title}`
      );
    } catch (err) {
      logger.error(`Bulk push notification error:`, err);
    }
  }
}
