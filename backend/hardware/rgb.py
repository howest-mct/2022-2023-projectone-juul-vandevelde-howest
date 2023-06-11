import time
import board
import neopixel

pixel_pin = board.D18

num_pixels = 8

ORDER = neopixel.GRB

pixels = neopixel.NeoPixel(pixel_pin, num_pixels,
                           brightness=0.2, auto_write=False, pixel_order=ORDER)


while True:
    pixels.fill((255, 0, 0))
    pixels.show()
    time.sleep(1)

    pixels.fill((0, 255, 0))
    pixels.show()
    time.sleep(1)

    pixels.fill((0, 0, 255))
    pixels.show()
    time.sleep(1)
