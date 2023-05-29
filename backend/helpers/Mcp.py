import spidev

class Mcp:
    def __init__(self, bus=0, device=1):
        self.bus = bus
        self.device = device
        self.spi = spidev.SpiDev()
        self.spi.open(self.bus, self.device)
        self.spi.max_speed_hz = 10 ** 5

    def read_channel(self, ch):
        bytes_out = [1, ((8 | ch) << 4), 0]
        bytes_in = self.spi.xfer(bytes_out)
        LSB = bytes_in[2]
        MSB = (bytes_in[1] & 0b00000011) << 8
        RES = MSB | LSB
        return RES
        self.closespi()

    def closespi(self):
        self.spi.close()
