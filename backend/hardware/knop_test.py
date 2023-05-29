from RPi import GPIO


class Button:
    def __init__(self, pin, bouncetime=200):
        self.pin = pin
        self.bouncetime = bouncetime

        GPIO.setmode(GPIO.BCM)
        GPIO.setup(pin, GPIO.IN, GPIO.PUD_UP)

    @property
    def pressed(self):
        ingedrukt = GPIO.input(self.pin)
        return not ingedrukt

    def on_press(self, call_method):
        GPIO.add_event_detect(self.pin, GPIO.FALLING,
                              call_method, bouncetime=self.bouncetime)

    def on_release(self, call_method):
        GPIO.add_event_detect(self.pin, GPIO.RISING,
                              call_method, bouncetime=self.bouncetime)

    def on_both(self, call_method):
        GPIO.add_event_detect(self.pin, GPIO.BOTH,
                              call_method, bouncetime=self.bouncetime)


reed1 = Button(21)


def setup():
    GPIO.setmode(GPIO.BCM)
    GPIO.setmode(GPIO.BCM)
    reed1.on_press(lees_knop)


def lees_knop(pin):
    if reed1.pressed:
        print("**** shutdown ****")


try:
    setup()
    while True:
        pass

except KeyboardInterrupt as e:
    print(e)

finally:
    GPIO.cleanup()
    print("finished")
