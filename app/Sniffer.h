#ifndef Sniffer_h
#define Sniffer_h

#include <WiFi.h>

typedef struct
{
    uint8_t mac[6];
} mac_addr_t;

int initSniffer();
void startSniffer();
void stopSniffer();
void printScanResult();

#endif