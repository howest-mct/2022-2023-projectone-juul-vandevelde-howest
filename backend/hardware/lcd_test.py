from subprocess import check_output
import RPi.GPIO as GPIO
from smbus import SMBus
import time

printed = False

class LCD:
    def __init__(self, rs=26, e=19) -> None:
        self.rs = rs
        self.e = e
        self.i2c = SMBus()
        self.i2c.open(1)
    
    def init_GPIO(self):
        GPIO.setmode(GPIO.BCM)
        GPIO.setup((self.rs, self.e), GPIO.OUT)

    def set_byte(self, value):
        self.i2c.write_byte(0x20, value)
        GPIO.output(self.e,GPIO.HIGH)
        time.sleep(0.1)
        GPIO.output(self.e,GPIO.LOW)
        

    def init_LCD(self):
        for i in range(3):
            self.send_instruction(0b00111000)
        self.send_instruction(0b00001111)
        self.send_instruction(0b00000001)
        
    def send_instruction(self, value):
        GPIO.output(self.rs,GPIO.LOW)
        self.set_byte(value)
        GPIO.output(self.rs,GPIO.HIGH)

    def send_character(self, value):
        GPIO.output(self.rs,GPIO.HIGH)
        self.set_byte(value)
        GPIO.output(self.rs,GPIO.LOW)

    def write_message(self, message):
        counter = 0
        for letter in message:
            self.send_character(ord(letter))
            counter += 1
            if counter == 16:
                self.go_to_second_row()
            elif counter >= 32:
                self.scroll_screen()
    
    def go_to_second_row(self):
        self.send_instruction(0b11000000)
    
    def clear_screen(self):
        self.send_instruction(0b00000001)
    
    def scroll_screen(self):
        self.send_instruction(0b00011000)
        time.sleep(0.1)
    
    def disable_cursor(self):
        self.send_instruction(0b00001100)

    def close_i2c(self):
        self.i2c.close()

lcdObject = LCD()

def setup():
    lcdObject.init_GPIO()
    lcdObject.init_LCD()
    lcdObject.disable_cursor()

try:
    setup()
    all_out_last_run = time.time()
    while True:
        now = time.time()
        if (now >= all_out_last_run + 15):
                output = check_output(['hostname', '--all-ip-addresses'])
                str_ips = str(output)
                str_ips = str_ips.replace("b'", "")
                str_ips = str_ips.replace(" \\n'", "")
                ips = str_ips.split(' ')
                lcdObject.clear_screen()
                lcdObject.write_message(ips[0])
                lcdObject.go_to_second_row()
                lcdObject.write_message(ips[1])
                printed = False
                time.sleep(5)
                all_out_last_run = now
        elif printed == False:
            lcdObject.clear_screen()
            lcdObject.write_message('Waiting ...')
            printed = True

except KeyboardInterrupt as e:
    print(e)

finally:
    GPIO.cleanup()
    print("finished")
