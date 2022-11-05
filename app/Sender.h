#ifndef Sender_h
#define Sender_h

#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>


#define WIFI_SSID "REPLACE_WITH_YOUR_SSID"
#define WIFI_PASSWORD "REPLACE_WITH_YOUR_PASSWORD"
#define SERVER_NAME "http://:"

void setupWiFi(const char* ssid, const char* password);
void sendJson(String serverName, String json);
void deinitWiFi();
void transmitData(String json);

#endif