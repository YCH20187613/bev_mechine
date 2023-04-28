#include <SoftwareSerial.h>
#include <Servo.h>
#include <Unistep2.h>

const uint8_t module_outputpin = 3; //setting output pin
const uint8_t module_inputpin = 2; // setting input pin

Servo myservo; //creating servo
Unistep2 mystepper(8, 9, 10, 11, 4096, 1000); //creating stepper

String readBuffer = ""; //buffer for data read-in
SoftwareSerial bluth(module_inputpin, module_outputpin); //create software serial



void setup() {
  // put your setup code here, to run once:
  bluth.begin(9600); //begin the bluetooth module on 9600 baud rate
  Serial.begin(9600); //begin the serial module on 9600 baud rate
  bluth.print("AT+NAME=BMbluth"); //AT commands to configurate the board
  bluth.print("AT+UUID0xFFE0");
  bluth.print("AT+CHAR0xFFE1");
  myservo.attach(7); //attach servo at pin 7
  reset_pos(); //reset stepper motor position
}

void loop() {
  // put your main code here, to run repeatedly:
  while (bluth.available() > 0) { // when command comes in
    stepper.run();
    readBuffer = bluth.read(); // store read data in buffer
    if (mystepper.stepsToGo() == 0){ // stepper finished all the steps
      
      if (readBuffer.length() == 2){ // select mode command
        switch (readBuffer){
        case (readBuffer == "s1"):
          reset_pos();
          delay(5000);
          move_drink_1();
          delay(5000);
          servo_pour(4);
          readBuffer = "";
          break;
        case (readBuffer == "s2"):
          reset_pos();
          delay(5000);
          move_drink_2();
          delay(10000);
          servo_pour(4);
          readBuffer = "";
          break;
        case (readBuffer == "s2"):
          reset_pos();
          delay(5000);
          move_drink_3();
          delay(15000);
          servo_pour(4);
          readBuffer = "";
          break;
        }
      }else if (readBuffer.length() > 2) { //eg a1b1c1, a0b2c2...
        char d1rep = toInt(readBuffer.charAt(1)); // extract the command to integer as repetition of the operations
        char d2rep = toInt(readBuffer.charAt(3));
        char d3rep = toInt(readBuffer.charAt(5));
        reset_pos();
        delay(5000);
        move_drink_1();
        servo_pour(d1rep);
        delay(5000 * d1rep);
        move_left();
        servo_pour(d2rep);
        delay(5000 * d2rep);
        move_left();
        servo_pour(d3rep);   
      }
    }
  }
}


void reset_pos(){ // reset position
  mystepper.move(18432);
}


void move_left(){ //move to the next drink after the first drink
    mystepper.move(-6553);
} 

void move_drink_1(){ // move to drink 1 position
  mystepper.move(-6100);
}

void move_drink_2(){ //move to drink 2 position
  mystepper.move(-11879);
}

void move_drink_3(){ // move to drink 3 position
  mystepper.move(-18432);
}
  
void servo_pour(int times){ // servo operation
  for (int rep = 0; rep < times; rep++){
        myservo.write(45);
        delay(5000);
        myservo.write(0);
        delay(500);
  }
}
