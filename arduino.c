#include <SoftwareSerial.h>
#include "bluetooth.h"
void setup() {
  Serial.begin(9600);
  pinMode(3, OUTPUT);
  analogWrite(3, 0);
  config_remote();
  remote_set_name("module1");
}
void loop() {
  bool taser = remote_get_command();
  if(taser){
    analogWrite(3, 255);
    Serial.println("TASER");
    delay(100);
  }
  analogWrite(3, 0);
  if(taser){
    delay(3000);
  }
  remote_send("From Arduino: " + String(millis()));
  delay(100);
}





8:07
const int BLUETOOTH_TX = A4; //SDA
const int BLUETOOTH_RX = A5; //SCL
SoftwareSerial bluetooth(BLUETOOTH_TX, BLUETOOTH_RX);
typedef struct Command{
  int joyX;
  int joyY;
  int slider;
  int button;
} Command;
void config_remote(){
  bluetooth.begin(9600);
}
void remote_set_name(String name){
  bluetooth.println(String("AT+NAME")+name);
  delay(100);
  bluetooth.println("AT+RESET");
  while (bluetooth.available()) { bluetooth.read(); }
}
bool remote_get_command(){
  while (bluetooth.available()) {
    char c = bluetooth.read();
    Serial.println(c);
    if (c== 'T') return true;
  }
  return false;
}
void remote_send(String messsage){
  bluetooth.println(messsage);
} 