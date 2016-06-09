# particle_pebble


## Synopsis

This project ties together the Pebble smartwatch and the Particle cloud, allowing you to easily monitor your Particle device data from your wrist. You can view all Particle devices (Electrons, Photons, Cores) associated with your account, check which devices are online, check which variables are being exposed through the cloud, and you can view each variables value.


## Installation

1. In orer to use this code you must have a [CloudPebble](https://cloudpebble.net/) account and a [Particle](https://www.particle.io/) account.
2. Create a new Pebble.js app on CloudPebble and paste this code into the app.js file. Make sure to fill in your Particle account's unique access token on line 8.
3. Use CloudPebble to install the app onto your phone.
4. Program a Particle device to expose at least one variable using `Particle.variable()` (see reference material [here](https://docs.particle.io/reference/firmware/photon/#particle-variable-))
5. When you run the watch app you should be able to see all devices connected to your Particle account and their online status.
6. Click a device to view all avaialble variables.
7. Click a variable to see its value and the time it was last updated.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
