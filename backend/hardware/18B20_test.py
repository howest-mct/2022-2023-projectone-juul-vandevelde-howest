import time
sensor_file_name = '/sys/bus/w1/devices/28-22c941000900/temperature'

try:
    while 1:
        sensor_file = open(sensor_file_name, 'r')
        for temperature in sensor_file:
            temperature = temperature.rstrip('\n')
            temperature = int(temperature) / 1000
            print(f"De temperatuur is {temperature:.2f} °Celcius")
        sensor_file.close()
        time.sleep(1)
except Exception as ex:
    print("Error: {}", format(ex))
finally:
    print("Cleanup")
    