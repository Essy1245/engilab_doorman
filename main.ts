enum RadioMessage {
    message1 = 49434,
    opendoor = 45418
}
input.onButtonPressed(Button.A, function () {
    OpenDoor()
})
radio.onReceivedMessage(RadioMessage.opendoor, function () {
    OpenDoor()
})
// Status 1 means locked
// status 0 means unlocked
function Lockdown (status: number) {
    if (status == 1) {
        basic.showLeds(`
            # # # # #
            # . . . #
            # # # # #
            # # . # #
            # # # # #
            `)
        if (debug == 1) {
            serial.writeLine("Device Locked.")
        }
    }
}
function UpdateAverage () {
    basic.showIcon(IconNames.No)
    basic.pause(1000)
    baseline = 0
    basic.showLeds(`
        . . # . .
        . . # . .
        . . # . .
        . . . . .
        . . # . .
        `)
    for (let index = 0; index < 10000; index++) {
        baseline += input.acceleration(Dimension.Strength)
    }
    baseline = baseline / 10000
    basic.showIcon(IconNames.Yes)
    if (debug == 1) {
        serial.writeLine("Average is " + baseline)
    }
    basic.pause(2000)
    basic.clearScreen()
    basic.showIcon(IconNames.Asleep)
}
radio.onReceivedString(function (receivedString) {
    if (receivedString.includes("opendoor")) {
        OpenDoor()
    }
})
function OpenDoor () {
    basic.showIcon(IconNames.Happy)
    pins.digitalWritePin(DigitalPin.P0, 1)
    basic.pause(5000)
    pins.digitalWritePin(DigitalPin.P0, 0)
    basic.clearScreen()
    listening = 0
    knockcount = 0
    basic.pause(500)
    pins.digitalWritePin(DigitalPin.P0, 1)
    basic.pause(270)
    pins.digitalWritePin(DigitalPin.P0, 0)
}
function update_parameters () {
    debug = 0
    Measurement_error_range = 50
    Filtered_Acceleration = 0
    baseline = 0
    knockcount = 0
    timeout_ms = 5500
    listening = 0
}
let timeout_ms = 0
let Filtered_Acceleration = 0
let Measurement_error_range = 0
let knockcount = 0
let listening = 0
let baseline = 0
let debug = 0
radio.setGroup(1)
basic.showIcon(IconNames.Heart)
update_parameters()
basic.pause(100)
UpdateAverage()
// not doing anything at all somehow
basic.forever(function () {
    if (Filtered_Acceleration >= 25) {
        basic.showIcon(IconNames.Surprised)
        listening = 1
        knockcount += 1
        basic.pause(130)
        basic.clearScreen()
        basic.showIcon(IconNames.Asleep)
    }
})
basic.forever(function () {
    if (listening == 1) {
        basic.pause(timeout_ms)
        knockcount = 0
        listening = 0
    }
})
basic.forever(function () {
    if (knockcount >= 2) {
        listening = 0
        knockcount = 0
        OpenDoor()
    }
})
basic.forever(function () {
    if (debug == 1) {
        serial.writeValue("k", knockcount)
        serial.writeValue("FA", Filtered_Acceleration)
    }
    if (Math.abs(input.acceleration(Dimension.Strength) - baseline) < Measurement_error_range) {
        Filtered_Acceleration = 0
    } else if (Math.abs(input.acceleration(Dimension.Strength) - baseline) >= 1030) {
        Filtered_Acceleration = 0
    } else {
        Filtered_Acceleration = Math.abs(input.acceleration(Dimension.Strength) - baseline)
    }
})
