from time import sleep
from RPi import GPIO
from mfrc522 import SimpleMFRC522
reader = SimpleMFRC522()

try:
    while True:
        print("Hold a tag near the reader")
        id, text = reader.read()
        print("ID: %s\nText: %s" % (id,text))
        sleep(5)


        # om data op de tag te zetten
        # reader.write("Hallo ;)")
except KeyboardInterrupt:
    GPIO.cleanup()
    raise
