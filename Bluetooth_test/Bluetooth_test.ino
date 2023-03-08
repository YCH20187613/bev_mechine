#include <SoftwareSerial.h>

const uint8_t module_outputpin = 3;
const uint8_t module_inputpin = 2;

SoftwareSerial bluth(module_inputpin, module_outputpin);

void setup() {
  // put your setup code here, to run once:
  bluth.begin(9600);
  Serial.begin(9600);
  bluth.print("AT+NAME=BMbluth");

}

void loop() {
  // put your main code here, to run repeatedly:
  if (bluth.available()) {
    Serial.write(bluth.read());
  }

  if (Serial.available()) {
    bluth.write(Serial.read());
  }
}
