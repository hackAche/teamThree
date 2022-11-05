#include <WiFi.h>
#include <HTTPClient.h>
#include "esp_wifi.h"

const char* ssid = "REPLACE_WITH_YOUR_SSID";
const char* password = "REPLACE_WITH_YOUR_PASSWORD";

String serverName = "http://192.168.1.106:1880/update-sensor";

uint64_t lastSyncTime = 0; 
uint64_t conectionDelay = 10000; // 10 seconds 



void setup(){
    Serial.begin(115200);
}

void loop(){

}