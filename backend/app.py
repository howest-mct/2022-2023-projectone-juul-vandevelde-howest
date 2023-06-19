from repositories.DataRepository import DataRepository
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS

from helpers.DS18B20 import DS18B20
from helpers.Button import Button
from helpers.Mcp import Mcp
from helpers.Lcd import Lcd

from mfrc522 import SimpleMFRC522
from RPi import GPIO
import subprocess
import threading
import neopixel
import board
import time

GPIO.setmode(GPIO.BCM)

pixel_pin = board.D18
num_pixels = 16
ORDER = neopixel.GRB
pixels = neopixel.NeoPixel(pixel_pin, num_pixels,
                           brightness=1, auto_write=False, pixel_order=ORDER)

rfid_reader = SimpleMFRC522()
mcp_object = Mcp()
DS18B20_object = DS18B20()
lcdObject = Lcd()

reed_1 = Button(12)
reed_2 = Button(6)
break_beam_1 = Button(20, 1000)
break_beam_2 = Button(16, 1000)
shutdown_btn = Button(21)
solenoid = 24

printed = False
first_iteration = True


def hex_to_rgb(hex_code):
    hex_code = hex_code.lstrip('#')
    rgb = tuple(int(hex_code[i:i+2], 16) for i in (0, 2, 4))
    return rgb


def setup():
    GPIO.setup(solenoid, GPIO.OUT)

    lcdObject.init_LCD()

    shutdown_btn.on_press(shutdown)
    shutdown(shutdown_btn)

    reed_1.on_both(read_switch_1)
    read_switch_1(reed_1)

    reed_2.on_both(read_switch_2)
    read_switch_2(reed_2)

    break_beam_1.on_both(read_beam_1)
    read_beam_1(break_beam_1)

    break_beam_2.on_both(read_beam_2)
    read_beam_2(break_beam_2)


def shutdown(pin):
    # deze code blokkeerd de rest, maar dit is niet erg aangezien de pi hier toch afgesloten wordt
    start_time = time.time()
    shutdown_initiated = False
    while shutdown_btn.pressed:
        if (time.time() - start_time) > 5 and shutdown_initiated == False:
            shutdown_initiated = True
            shutdown_pi()


def read_switch_1(pin):
    if reed_1.pressed:
        print("door closed")
        DataRepository.add_device_history(6, None, 0, None)
        socketio.emit('B2F_door_changed')
    else:
        print("door open")
        DataRepository.add_device_history(6, None, 1, None)
        socketio.emit('B2F_door_changed')

def read_switch_2(pin):
    if reed_2.pressed:
        print("pakketjeslade closed")
        DataRepository.add_device_history(7, None, 0, None)
    else:
        print("pakketjeslade open")
        DataRepository.add_device_history(7, None, 1, None)

def read_beam_1(pin):
    if break_beam_1.pressed:
        print("parcel detected")
        DataRepository.add_device_history(4, None, 1, None)
        socketio.emit('B2F_mail_status_changed')
    else:
        print("mailbox emptied")
        DataRepository.add_device_history(4, None, 0, None)

def read_beam_2(pin):
    if break_beam_2.pressed:
        print("letter detected")
        DataRepository.add_device_history(5, None, 1, None)
        socketio.emit('B2F_mail_status_changed')
    else:
        print("mailbox emptied")
        DataRepository.add_device_history(5, None, 0, None)


def read_ldr():
    light_intensity = 100 - ((mcp_object.read_channel(0) / 1023) * 100)
    print(f"{light_intensity:.2f}%")
    DataRepository.add_device_history(1, None, light_intensity, None)
    if light_intensity <= 30:
        rgb = hex_to_rgb(DataRepository.read_current_color()['value'])
        pixels.fill((rgb[0], rgb[1], rgb[2]))
        pixels.show()
    else:
        pixels.fill((0, 0, 0))
        pixels.show()


def read_rfid():
    global first_iteration
    last_runtime = time.time()
    while True:
        if (first_iteration == True) or ((time.time() - last_runtime) > 5):
            print("**** Hold a tag near the reader ****")
            id, password = rfid_reader.read()
            if (DataRepository.check_rfid(id, password))['user_exists'] == 1:
                DataRepository.add_device_history(2, 1, id, None)
                print("Door unlocked by rfid")
                GPIO.output(solenoid, GPIO.HIGH)
                time.sleep(1)
                GPIO.output(solenoid, GPIO.LOW)
                DataRepository.add_device_history(
                    9, None, DataRepository.get_user_id(id)['user_id'], None)
                socketio.emit('B2F_mail_status_changed')
            else:
                DataRepository.add_device_history(2, None, id, None)
                print("You don't have access :(")
            last_runtime = time.time()
            first_iteration = False


def write_rfid():
    message = "very strong password"
    rfid_reader.write(message)
    # nodig als een gebruiker een tag wilt toevoegen


def read_temperature():
    temperature = DS18B20_object.get_temperature()
    print(f"De temperatuur is {temperature:.2f} °Celcius")
    DataRepository.add_device_history(3, None, temperature, None)


def start_threads():
    rfid_thread = threading.Thread(target=read_rfid, daemon=True)
    rfid_thread.start()
    socketio_thread = threading.Thread(target=start_socketio, daemon=True)
    socketio_thread.start()
    print("threads started")


app = Flask(__name__)
app.config['SECRET_KEY'] = 'y8L3uH&qUC3U7$1*^LfYQnj7%wm$3w'

socketio = SocketIO(app, cors_allowed_origins="*",
                    async_mode='gevent', ping_interval=0.5)
CORS(app)

endpoint = '/api/v1'


# API ENDPOINTS
@app.route('/')
def info():
    return jsonify(info='Please go to the endpoint ' + endpoint)


@app.route(endpoint + '/devices/', methods=['GET'])
def get_devices():
    if request.method == 'GET':
        data = DataRepository.read_devices()
        return jsonify(devices=data), 200


@app.route(endpoint + '/user-names/', methods=['GET'])
def get_user_names():
    if request.method == 'GET':
        data = DataRepository.read_user_names()
        return jsonify(users=data), 200


@app.route(endpoint + '/user-names/<user_id>/', methods=['GET'])
def get_user_details(user_id):
    if request.method == 'GET':
        data = DataRepository.read_user_details(user_id)
        return jsonify(data), 200


@app.route(endpoint + '/history/<device_id>/', methods=['GET'])
def get_history(device_id):
    if request.method == 'GET':
        data = DataRepository.read_device_history(device_id)
        return jsonify(history=data), 200


@app.route(endpoint + '/history/today/<device_id>/', methods=['GET'])
def get_history_today(device_id):
    if request.method == 'GET':
        data = DataRepository.read_device_history_today(device_id)
        return jsonify(history=data), 200


@app.route(endpoint + '/history/recent/<device_id>/', methods=['GET'])
def get_most_recent_history(device_id):
    if request.method == 'GET':
        data = DataRepository.read_most_recent_device_history(device_id)
        return jsonify(recent_history=data), 200


@app.route(endpoint + '/mail-contents/', methods=['GET'])
def get_mailbox_contents():
    if request.method == 'GET':
        data = DataRepository.check_mailbox_contents()
        return jsonify(data), 200


@app.route(endpoint + '/login/', methods=['POST'])
def check_login():
    if request.method == 'POST':
        input = DataRepository.json_or_formdata(request)
        data = DataRepository.check_login(input['username'], input['password'])
        return jsonify(data), 200


@app.route(endpoint + '/mail-history/', methods=['GET'])
def get_mail_history():
    if request.method == 'GET':
        data = DataRepository.read_mail_history()
        return jsonify(history=data), 200


@app.route(endpoint + '/unlock-history/', methods=['GET'])
def get_unlock_history():
    if request.method == 'GET':
        data = DataRepository.read_unlocks_per_user()
        return jsonify(history=data), 200


@app.route(endpoint + '/timeline/', methods=['GET'])
def get_timeline():
    if request.method == 'GET':
        data = DataRepository.get_timeline()
        return jsonify(timeline=data), 200


@app.route(endpoint + '/current-color/', methods=['GET'])
def get_current_color():
    if request.method == 'GET':
        data = DataRepository.read_current_color()
        return jsonify(current_color=data), 200


@app.route(endpoint + '/change-color/', methods=['PUT'])
def update_color():
    if request.method == 'PUT':
        input = DataRepository.json_or_formdata(request)
        data = DataRepository.add_device_history(
            10, None, input['color_hex'], None)
        return jsonify(history_id=data), 200

# SOCKET IO


@socketio.on('connect')
def initial_connection():
    print('A new client connect')


@socketio.on('F2B_color_changed')
def change_color():
    rgb = hex_to_rgb(DataRepository.read_current_color()['value'])
    pixels.fill((rgb[0], rgb[1], rgb[2]))
    pixels.show()


@socketio.on('F2B_shutdown')
def shutdown_pi():
    DataRepository.add_device_history(11, None, None, None)
    print("**** shutdown ****")
    lcdObject.clear_screen()
    pixels.fill((0, 0, 0))
    pixels.show()
    mcp_object.closespi()
    GPIO.cleanup()
    subprocess.call("sudo shutdown now", shell=True)


@socketio.on('F2B_open_door')
def open_door(jsonobject):
    status = DataRepository.read_most_recent_device_history(6)
    if int(status['value']) == 0:
        print("Door unlocked by website")
        GPIO.output(solenoid, GPIO.HIGH)
        time.sleep(1)
        GPIO.output(solenoid, GPIO.LOW)
        DataRepository.add_device_history(9, None, jsonobject['user_id'], None)
        socketio.emit('B2F_mail_status_changed')
    else:
        print("Door already unlocked")


def start_socketio():
    print("**** Starting APP ****")
    socketio.run(app, debug=False, host='0.0.0.0')


if __name__ == '__main__':
    try:
        setup()
        start_threads()
        last_runtime_setup = time.time()
        last_ldr_runtime = last_runtime_setup
        last_temperature_runtime = last_runtime_setup
        last_ip_runtime = last_runtime_setup
        while True:
            if (time.time() - last_ldr_runtime) > 15:
                read_ldr()
                last_ldr_runtime = time.time()

            if (time.time() - last_temperature_runtime) > 60:
                read_temperature()
                last_temperature_runtime = time.time()

            if (time.time() - last_ip_runtime) > 15:
                if printed == True:
                    lcdObject.show_ip()
                    printed = False
                if (time.time() - last_ip_runtime) > (15 + 15):
                    last_ip_runtime = time.time()
            elif printed == False:
                lcdObject.disable_cursor()
                lcdObject.clear_screen()
                lcdObject.write_message('<- Mail        |')
                lcdObject.go_to_second_row()
                lcdObject.write_message('       Parcels v')
                printed = True
            time.sleep((0.001))

    except KeyboardInterrupt:
        print(' KeyboardInterrupt exception is caught')

    finally:
        mcp_object.closespi()
        GPIO.cleanup()
        print("finished")
