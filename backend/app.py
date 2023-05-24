import threading
import time
from repositories.DataRepository import DataRepository
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from RPi import GPIO
from helpers.klasseknop import Button

reed1 = Button(12)

def setup_gpio():
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
    reed1.on_both(lees_knop)

def lees_knop(pin):
    if reed1.pressed:
        print("**** door closed ****")
    else:
        print("**** door open ****")
            
app = Flask(__name__)
app.config['SECRET_KEY'] = 'y8L3uH&qUC3U7$1*^LfYQnj7%wm$3w'

socketio = SocketIO(app, cors_allowed_origins="*",
                    async_mode='gevent', ping_interval=0.5)
CORS(app)

endpoint = '/api/v1'


# def start_thread():
#     t = threading.Thread(target=thread_function, daemon=True)
#     t.start()
#     print("thread started")


# API ENDPOINTS
@app.route('/')
def info():
    return jsonify(info='Please go to the endpoint ' + endpoint)


@app.route(endpoint + '/devices/', methods=['GET'])
def get_devices():
    if request.method == 'GET':
        data = DataRepository.read_devices()
        return jsonify(devices=data), 200


@app.route(endpoint + '/history/<device_id>/', methods=['GET'])
def get_history(device_id):
    if request.method == 'GET':
        data = DataRepository.read_history_by_device(device_id)
        return jsonify(history=data), 200


# SOCKET IO
@socketio.on('connect')
def initial_connection():
    print('A new client connect')
    devices = DataRepository.read_devices()
    emit('B2F_devices', {'devices': devices}, broadcast=False)

# get realtime data from the sensor
# @socketio.on('F2B')
# def get_data():
#     pass


if __name__ == '__main__':
    try:
        setup_gpio()
        lees_knop(reed1)
        print("**** Starting APP ****")
        socketio.run(app, debug=False, host='0.0.0.0')
    except KeyboardInterrupt:
        print('KeyboardInterrupt exception is caught')
    finally:
        GPIO.cleanup()
        print("finished")
