from helpers.DS18B20 import DS18B20
from helpers.Button import Button
from helpers.Mcp import Mcp
from helpers.Lcd import Lcd

from mfrc522 import SimpleMFRC522
from RPi import GPIO
import threading
import time

GPIO.setmode(GPIO.BCM)

rfid_reader = SimpleMFRC522()
mcp_object = Mcp()
DS18B20_object = DS18B20()
lcdObject = Lcd()

reed_1 = Button(12, 20)
break_beam_1 = Button(20, 5)
shutdown_btn = Button(21)

printed = False


def setup():
    lcdObject.init_LCD()

    shutdown_btn.on_press(shutdown)
    shutdown(shutdown_btn)

    reed_1.on_both(read_switch)
    read_switch(reed_1)

    break_beam_1.on_both(read_beam)
    read_beam(break_beam_1)


def shutdown(pin):
    # deze code blokkeerd de rest, maar dit is niet erg aangezien de pi hier toch afgesloten wordt
    start_time = time.time()
    shutdown_initiated = False
    while shutdown_btn.pressed:
        if (time.time() - start_time) > 10 and shutdown_initiated == False:
            shutdown_initiated = True
            print("**** shutdown ****")


def read_switch(pin):
    if reed_1.pressed:
        print("**** door closed ****")
    else:
        print("**** door open ****")


def read_beam(pin):
    if break_beam_1.pressed:
        print("**** you received a letter/parcel ****")


def read_ldr():
    light_intensity = 100 - ((mcp_object.read_channel(0) / 1023) * 100)
    print(f"{light_intensity:.2f}%")


def read_rfid():
    last_runtime = time.time()
    while True:
        if (time.time() - last_runtime) > 5:
            print("Hold a tag near the reader")
            id, text = rfid_reader.read()
            print("ID: %s\nText: %s" % (id, text))
            last_runtime = time.time()


def write_rfid():
    message = str(input("New data: "))
    rfid_reader.write(message)


def read_temperature():
    print(f"De temperatuur is {DS18B20_object.get_temperature():.2f} °Celcius")


def show_ip():
    all_out_last_run = time.time()
    while True:
        now = time.time()
        if (now >= all_out_last_run + 15):
            lcdObject.show_ip()


def start_thread():
    t1 = threading.Thread(target=read_rfid, daemon=True)
    t1.start()
    print("thread started")


try:
    setup()
    start_thread()
    last_runtime_setup = time.time()
    last_ldr_runtime = last_runtime_setup
    last_temperature_runtime = last_runtime_setup
    last_ip_runtime = last_runtime_setup
    while True:
        if (time.time() - last_ldr_runtime) > 15:
            read_ldr()
            print("ldr", time.time())
            last_ldr_runtime = time.time()

        if (time.time() - last_temperature_runtime) > 15:
            read_temperature()
            print("temp", time.time())
            last_temperature_runtime = time.time()

        if (time.time() - last_ip_runtime) > 15:
            if printed == True:
                lcdObject.show_ip()
                printed = False
            if (time.time() - last_ip_runtime) > (15 + 10):
                last_ip_runtime = time.time()
        elif printed == False:
            lcdObject.disable_cursor()
            lcdObject.clear_screen()
            lcdObject.write_message('Nuttige info')
            printed = True
        time.sleep((0.001))

except KeyboardInterrupt:
    print(' KeyboardInterrupt exception is caught')

finally:
    mcp_object.closespi()
    GPIO.cleanup()
    print("finished")
