from RPi import GPIO

reed = 21


def setup():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(reed, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.add_event_detect(
        reed, GPIO.FALLING, callback=reed_callback, bouncetime=200)


def reed_callback(channel):
    print("hallo")


try:
    setup()
    while True:
        pass

except KeyboardInterrupt as e:
    print(e)

finally:
    GPIO.cleanup()
    print("finished")
