#include <SoftwareSerial.h>
#include <Servo.h>

const uint8_t module_outputpin = 3; //setting output pin
const uint8_t module_inputpin = 2; // setting input pin

Servo myservo; 

SoftwareSerial bluth(module_inputpin, module_outputpin); //create software serial

void setup() {
  // put your setup code here, to run once:
  bluth.begin(9600); //begin the bluetooth module on 9600 baud rate
  Serial.begin(9600); //begin the serial module on 9600 baud rate
  bluth.print("AT+NAME=BMbluth"); //AT commands to configurate the board
  bluth.print("AT+UUID0xFFE0");
  bluth.print("AT+CHAR0xFFE1");
  myservo.attach(9);
  
}

void loop() {
  // put your main code here, to run repeatedly:
  if (bluth.available()) {
    Serial.write(bluth.read()); //start reading data
    
  }

  if (Serial.available()) {
    bluth.write(Serial.read());
    
  }
    
    
    
    
  
}
