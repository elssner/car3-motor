input.onButtonEvent(Button.AB, ButtonEvent.LongClick, function () {
    basic.showString("1BE6M")
})
radio.onReceivedNumber(function (receivedNumber) {
    btLaufzeit = input.runningTime()
    if (iStop == 3) {
        _("bei Stop=3 keine Funktion über Bluetooth aufrufen")
        radio.sendNumber(iStop + 2000)
    } else if (receivedNumber >= 900 && receivedNumber <= 1100) {
        _("900 ... 1100 MotorPower (- 1000)")
        if (MotorSteuerung(receivedNumber - 1000)) {
            _("iMotorPower hat sich geändert, neuen Wert senden")
            radio.sendNumber(iMotorPower + 1000)
            pins.digitalWritePin(DigitalPin.P3, Bit(iMotorPower < 0))
        } else if (iStop != 0) {
            _("Status senden + 2000")
            radio.sendNumber(iStop + 2000)
        } else {
            _("nichts geändert, aktuellen Wert senden")
            radio.sendNumber(iMotorPower + 1000)
        }
    } else if (receivedNumber >= 45 && receivedNumber <= 135) {
        _("0 ... 180 Servo Winkel")
    }
})
function fStop_beenden () {
    if (iMotorPower == 0 && !(iStop == 3)) {
        iStop = 0
    } else if (iMotorPower < 0 && iStop == 1) {
        iStop = 0
    }
}
function MotorSteuerung (pMotorPower: number) {
    if (!(btConnected)) {
        _("Bluetooth unterbrochen")
        iMotorPower = 0
        motors.motorCommand(MotorCommand.Coast)
        return false
    } else if (iMotorPower != pMotorPower) {
        _("connected und nur wenn von Sender empfangener Wert geändert")
        iMotorPower = pMotorPower
        fStop_beenden()
        _4digit.show(Math.abs(iMotorPower))
        if (iMotorPower == 0) {
            motors.motorCommand(MotorCommand.Break)
            basic.showIcon(IconNames.SmallDiamond)
        } else if (iMotorPower < 0) {
            motors.motorPower(iMotorPower)
            basic.showIcon(IconNames.ArrowSouth)
        } else if (iMotorPower > 0 && !(iStop == 1)) {
            motors.motorPower(iMotorPower)
            basic.showIcon(IconNames.ArrowNorth)
        } else {
            basic.showIcon(IconNames.No)
        }
        return true
    } else {
        return false
    }
}
function Bit (bool: boolean) {
    if (bool) {
        return 1
    } else {
        return 0
    }
}
input.onButtonEvent(Button.A, input.buttonEventClick(), function () {
    control.raiseEvent(
    EventBusSource.MICROBIT_ID_BUTTON_B,
    EventBusValue.MICROBIT_BUTTON_EVT_CLICK
    )
})
input.onButtonEvent(Button.AB, input.buttonEventClick(), function () {
    iStop = 0
    basic.clearScreen()
})
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    iStop = 3
    MotorSteuerung(0)
    basic.showIcon(IconNames.StickFigure)
})
function _ (Kommentar: string) {
	
}
input.onPinTouchEvent(TouchPin.P0, input.buttonEventDown(), function () {
    _("Notschalter, nur vorwärts")
    if (iMotorPower > 0) {
        iStop = 1
        motors.motorCommand(MotorCommand.Break)
        basic.showIcon(IconNames.Surprised)
    }
})
/**
 * P0 Taster; P3 LEDrückwärts
 */
let iMotorPower = 0
let btLaufzeit = 0
let btConnected = false
let iStop = 0
let _4digit: grove.TM1637 = null
_("Erweiterungen Funk und Grove laden")
_4digit = grove.createDisplay(DigitalPin.C16, DigitalPin.C17)
_4digit.point(true)
_4digit.set(7)
radio.setGroup(60)
iStop = 0
btConnected = false
btLaufzeit = input.runningTime()
_4digit.bit(0, 1)
loops.everyInterval(500, function () {
    _("Überwachung der Bluetooth Connection")
    if (input.runningTime() - btLaufzeit < 1000) {
        if (!(btConnected)) {
            btConnected = true
            basic.setLedColor(0x00ff00)
        }
    } else {
        btConnected = false
        MotorSteuerung(0)
        if (Math.trunc(input.runningTime() / 1000) % 2 == 1) {
            basic.setLedColor(0x0000ff)
        } else {
            basic.turnRgbLedOff()
        }
    }
})
