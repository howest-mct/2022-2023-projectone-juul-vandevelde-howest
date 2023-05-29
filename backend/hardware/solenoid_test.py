from RPi import GPIO
import time

solenoid = 24

def setup():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(solenoid, GPIO.OUT)

try:
    setup()
    while True:
        GPIO.output(solenoid, GPIO.LOW)
        print('uit')
        time.sleep(3)
        GPIO.output(solenoid, GPIO.HIGH)
        print('aan')
        time.sleep(0.75)

except KeyboardInterrupt as e:
    print(e)

finally:
    GPIO.cleanup()
    print("finished")
