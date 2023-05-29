class DS18B20:
    def __init__(self) -> None:
        self.sensor_file_name = '/sys/bus/w1/devices/28-22c941000900/temperature'
    
    def get_temperature(self):
        sensor_file = open(self.sensor_file_name, 'r')
        for temperature in sensor_file:
            temperature = temperature.rstrip('\n')
            temperature = int(temperature) / 1000
            return temperature
        sensor_file.close()
