#include "Sender.h"

void setupWiFi(const char* ssid, const char* password){
    uint32_t timeout = 0;
    Serial.println("Connecting to WiFi");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500); // milliseconds
        timeout++;
        if(timeout > 60){ // 30 seconds
            Serial.println("Connection timed out");
            ESP.restart();
        }
    }
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
}

void sendJson(String serverName, String json){
    while (WiFi.status() != WL_CONNECTED){
        delay(500);
        Serial.println("WiFi not connected");
    }

    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.POST(json);
    if(httpCode > 0){
        Serial.print("HTTP Response code: ");
        Serial.println(httpCode);
    } else {
        Serial.print("Error on sending POST: ");
        Serial.println(http.errorToString(httpCode));
    }
    http.end();
}

void deinitWiFi(){
    WiFi.disconnect();
    WiFi.mode(WIFI_OFF);
}

void transmitData(String json){
    setupWiFi(ssid, password);
    sendJson(serverName, json);
    deinitWiFi();
}