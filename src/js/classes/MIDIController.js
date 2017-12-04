import EventEmitter2 from '../vendors/eventemitter2';
import parseMIDIMessageData from '../lib/parseMIDIMessageData';

export default class MIDIController extends EventEmitter2 {
  constructor(access) {
    super({});

    this.access = access;

    this.access.onstatechange = e => this.handleStateChange(e);

    this.setMessageCallbacks();

    //SCOPE THIS Error
    // this.inputValues.forEach(val => val.onmidimessage = Data => this.emit(`midicontrollerkeyup`, parseMessageData(Data)));

    this.KEY_UP_COMMAND = 8;
    this.KEY_DOWN_COMMAND = 9;
  }

  /*
    METHODS
  */

  setMessageCallbacks = () => {
    this.inputValues = Array.from(this.access.inputs.values());
    this.inputValues.forEach(val => val.onmidimessage = message => this.handleMessage(message.data));
  }

  // EVENT HANDLING
  handleMessage = (data = [0, 0, 0]) => {
    const parsedData = parseMIDIMessageData(data);

    if (parsedData.command === this.KEY_UP_COMMAND) {
      this.emit(`midicontrollerkeyup`, parsedData);
    } else {
      this.emit(`midicontrollerkeydown`, parsedData);
    }
  }

  handleStateChange = e => {

    if (e.port.connection === `pending`) {
      console.info(`MIDI connection - PENDING`);
    }
    if (e.port.connection === `closed`) {
      console.info(`MIDI connection - CLOSED`);
    }
    if (e.port.connection === `open`) {
      console.info(`MIDI connection - OPEN`);
      this.access = e.srcElement;
      this.setMessageCallbacks();
    }
  }
}