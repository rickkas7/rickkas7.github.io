#include "Particle.h"

SYSTEM_THREAD(ENABLED);

SerialLogHandler logHandler;
void runTest();

void setup() {
    // Wait for a USB serial connection for up to 30 seconds
    waitFor(Serial.isConnected, 30000);
    runTest();
}

void loop() {
}

void runTest() {
    {
        String platform;

        switch (PLATFORM_ID) {
        case PLATFORM_GCC:
            platform = "gcc";
            break;

        case PLATFORM_PHOTON_PRODUCTION:
            platform = "Photon";
            break;

        case PLATFORM_P1:
            platform = "P1";
            break;

        case PLATFORM_ELECTRON_PRODUCTION:
            platform = "Electron/E Series";
            break;

        case PLATFORM_ARGON:
            platform = "Argon";
            break;

        case PLATFORM_BORON:
            platform = "Boron";
            break;

        case PLATFORM_ASOM:
            platform = "A SoM";
            break;

        case PLATFORM_BSOM:
            platform = "B SoM";
            break;

#ifdef PLATFORM_B5SOM
        case PLATFORM_B5SOM:
            platform = "B5 SoM";
            break;
#endif

#ifdef PLATFORM_TRACKER
        case PLATFORM_TRACKER:
            platform = "Tracker";
            break;
#endif
        default:
            platform = String::format("unknown platform %d", PLATFORM_ID);
            break;
        }

        Log.info("Platform: %s", platform.c_str());
    }

    {
        uint8_t a, b, c, d;

        a = (uint8_t)(SYSTEM_VERSION >> 24);
        b = (uint8_t)(SYSTEM_VERSION >> 16);
        c = (uint8_t)(SYSTEM_VERSION >> 8);
        d = (uint8_t)(SYSTEM_VERSION);

        const char *relType = 0;
        switch (d & 0xc0)
        {
        case 0x80:
            relType = "rc";
            d &= 0x3f;
            break;

        case 0x40:
            relType = "b";
            d &= 0x3f;
            break;

        case 0x00:
            if ((a == 0) || ((a == 1) && (b < 2)))
            {
                // Prior to 1.2.0, all were RC if a was != 0
                relType = "rc";
            }
            else
            {
                relType = "a";
            }
            break;

        default:
            break;
        }

        if (relType)
        {
            Log.info("Binary compiled for: %d.%d.%d-%s.%d", a, b, c, relType, d);
        }
        else
        {
            Log.info("Binary compiled for: %d.%d.%d", a, b, c);
        }

        Log.info("System version: %s", System.version().c_str());

        Log.info("Device ID: %s", System.deviceID().c_str());
    }
}