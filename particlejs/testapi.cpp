// Test Program for Cordova Test App
#include "Particle.h"

// Prototypes
int setLed(String arg);

// Globals
unsigned long lastClick = 0;
bool lowIsNew = true;
int ledValue = 0;

void setup() {
	Particle.function("setled", setLed);
	Particle.variable("led", ledValue);

	pinMode(D0, INPUT_PULLUP);
	pinMode(D7, OUTPUT);
}

void loop() {
	if (digitalRead(D0) == LOW) {
		if (lowIsNew && millis() - lastClick > 500) {
			ledValue = !ledValue;
			digitalWrite(D7, ledValue ? HIGH :LOW);

			Particle.publish("led", (ledValue ? "1" : "0"), PRIVATE);
			lastClick = millis();
			lowIsNew = false;
		}
	}
	else {
		lowIsNew = true;
	}
}


int setLed(String arg) {
	ledValue = (arg.toInt() != 0);

	digitalWrite(D7, ledValue ? HIGH :LOW);

	return 0;
}

