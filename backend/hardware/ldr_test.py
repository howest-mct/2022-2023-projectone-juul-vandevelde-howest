import RPi.GPIO as GPIO
import time
import spidev

class Mcp:
    def __init__(self, bus=0, device=0):
        self.bus = bus
        self.device = device
        self.spi = spidev.SpiDev()
        self.spi.open(self.bus, self.device)
        self.spi.max_speed_hz = 10 ** 5
    
    def read_channel(self, ch):
        bytes_out = [1, ((8|ch)<<4), 0]
        bytes_in = self.spi.xfer(bytes_out)
        LSB = bytes_in[2]
        MSB = (bytes_in[1] & 0b00000011) << 8
        RES = MSB | LSB
        return RES

    def closespi(self):
        self.spi.close()

mcpObject = Mcp()
previous_time = 0

def setup():
    GPIO.setmode(GPIO.BCM)

try:
    setup()
    while True:
        light_intensity = 100 - ((mcpObject.read_channel(1) / 1023) * 100)

        # Druk elke seconde de waarden af zonder dat de servo trager reageert.
        current_time = time.monotonic()
        if current_time - previous_time >= 1:
            print(f"{light_intensity:.2f}%")
            previous_time = current_time
        
except KeyboardInterrupt as e:
    print(e)

finally:
    mcpObject.closespi()
    GPIO.cleanup()
    print("klaar")