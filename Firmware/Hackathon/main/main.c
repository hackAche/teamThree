#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdint.h>

#include "esp_wifi.h"
#include "esp_wifi_types.h"
#include "esp_event.h"
#include "esp_event_loop.h"

#include "esp_system.h"
#include "ESP_LOG.h"

#define nameSsid "CRICO_PC_TRAVOU"

typedef struct
{
    uint8_t mac[6];
} mac_t;

mac_t *macList = NULL;
unint16_t macListSize = 0;

portMUX_TYPE myMutex = portMUX_INITIALIZER_UNLOCKED;

bool connected = false;

static void wifi_sniffer_packet_handler(void *buff, wifi_promiscuous_pkt_type_t type)
{
    if (type != WIFI_PKT_DATA)
        return;

    taskENTER_CRITICAL(&myMutex); //entra em seção crítica

    wifi_promiscuous_pkt_t *ppkt = (wifi_promiscuous_pkt_t *)buff;
    macList++;
    macList = realloc(macList, macListSize * sizeof(mac_t));
    memcpy(macList[macListSize - 1].mac, ppkt->payload, 6);
    
    taskEXIT_CRITICAL(&myMutex); //sai da seção crítica
}

void structToJson(){
    char *json = NULL;
    json = malloc(10+macListSize*20);
    sprintf(json, "{");
    for (int i = 0; i < macListSize; i++)
    {
        sprintf(json, "%s\"%02x:%02x:%02x:%02x:%02x:%02x\":%d,", json, macList[i].mac[0], macList[i].mac[1], macList[i].mac[2], macList[i].mac[3], macList[i].mac[4], macList[i].mac[5], 1);
    }
    sprintf(json, "%s}", json);

}


void app_main(void)
{
    esp_err_t err;

    wifi_init_config_t wifi_config = WIFI_INIT_CONFIG_DEFAULT();
    wifi_config.nvs_enable = false;
    err = esp_wifi_init(&wifi_config);
    if (err != ESP_OK)
    {
        ESP_LOGE("wifi", "esp_wifi_init failed: %s", esp_err_to_name(err));
        return;
    }
    err = esp_wifi_set_mode(WIFI_MODE_AP);
    if (err != ESP_OK)
    {
        ESP_LOGE("wifi", "esp_wifi_set_mode failed: %s", esp_err_to_name(err));
        return;
    }

    wifi_ap_config_t ap_config = {
        .ssid = nameSsid,
        .ssid_len = strlen(nameSsid),
        .max_connection = 4,
        .authmode = WIFI_AUTH_OPEN};

    err = esp_wifi_set_config(ESP_IF_WIFI_AP, &ap_config);
    if (err != ESP_OK)
    {
        ESP_LOGE("wifi", "esp_wifi_set_config failed: %s", esp_err_to_name(err));
        return;
    }

    err = esp_wifi_set_event_mask(WIFI_EVENT_MASK_ALL);
    if (err != ESP_OK)
    {
        ESP_LOGE("wifi", "esp_wifi_set_event_mask failed: %s", esp_err_to_name(err));
        return;
    }

    err = esp_wifi_set_mac(ESP_IF_WIFI_AP, (uint8_t[]){0xA5, 0x41, 0x00, 0x00, 0x00, 0x00});
    if (err != ESP_OK)
    {
        ESP_LOGE("wifi", "esp_wifi_set_mac failed: %s", esp_err_to_name(err));
        // return;
    }

    err = esp_wifi_set_promiscuous_rx_cb(&wifi_sniffer_packet_handler);
    if (err != ESP_OK)
    {
        ESP_LOGE("wifi", "esp_wifi_set_promiscuous_rx_cb failed: %s", esp_err_to_name(err));
        return;
    }
    esp_wifi_set_promiscuous(true);

    err = esp_wifi_start();
    if (err != ESP_OK)
    {
        ESP_LOGE("wifi", "esp_wifi_start failed: %s", esp_err_to_name(err));
        return;
    }

    while (1)
    {

    }
}
