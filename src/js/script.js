//import parseMidiMessage from './lib/parseMidiMessage';

//QUESTION overkill in onze toepassing?
// import Keyboard from './classes/Keyboard';
// let keyboard;

import MIDIController from './classes/MIDIController';
let midiController;

import onMIDIFailure from './lib/onMIDIFailure';

import createScene from './lib/createScene';
import createCamera from './lib/createCamera';
import createRenderer from './lib/createRenderer';
import createLights from './lib/createLights';
import createObjectOnNote from './lib/createObjectOnNote.js';
import Tree from './classes/Tree';
let scene, camera, renderer, controls;

import createSynth from './lib/createSynth';
let synth, pushedFrequencies = [], pushedNotes = [];

import Constants from './objects/Constants';

// Currently unavailable
//import {chord} from 'tonal-detect';

import teoria from 'teoria';
import piu from 'piu';


const getMIDIAccess = () => {
  if (navigator.requestMIDIAccess) {

    return navigator.requestMIDIAccess()
    .then(MIDISucces, onMIDIFailure);

  } else {
    console.log(`Your browser does not support the Web Midi API`);
  }
};

const MIDISucces = MIDIAccess => {
  midiController = new MIDIController(MIDIAccess);
  midiController.on(`midicontrollerkeyup`, handleControllerKeyUp);
  midiController.on(`midicontrollerkeydown`, handleControllerKeyDown);
};

const minorChordPlayed = () => {
  console.log(`MINOR PLAYED`);
};

const majorChordPlayed = () => {
  console.log(`MAJOR PLAYED`);
};

const checkChordType = () => {
  const teoriaNotes = pushedNotes.map(teoria.note.fromMIDI);
  // const triads = piu.triads(teoriaNotes);
  const infer = piu.infer(teoriaNotes);

  // Check if a chord is recognised
  if (infer.length === 0) return;

  if (infer[0].type === `m`) return minorChordPlayed();
  if (infer[0].type === ``) return majorChordPlayed();
};

const handleControllerKeyDown = ({note = 69, frequency = 440, velocity = 0.5}) => {
  //QUESTION: maybe a function creating objects based on frequencies instead of notes?
  // Maybe not, maybe rather play music based on notes
  createObjectOnNote(note, scene);
  pushedFrequencies.push(frequency);
  pushedNotes.push(note);
  synth.triggerAttack(pushedFrequencies, undefined, velocity);

  //Only check when multiple keys are being pressed
  if (pushedNotes.length > 1) checkChordType();
};

const handleControllerKeyUp = ({note = 69, frequency = 440}) => {
  pushedFrequencies = pushedFrequencies.filter(freq => freq !== frequency);
  pushedNotes = pushedNotes.filter(n => n !== note);
  synth.triggerRelease([frequency]);
};

const handleWindowResize = () => {
  Constants.WIDTH = window.innerWidth;
  Constants.HEIGHT = window.innerHeight;

  renderer.setSize(Constants.WIDTH, Constants.HEIGHT);
  console.log(camera.rotation);

  camera.aspect = Constants.WIDTH / Constants.HEIGHT;
  camera.updateProjectionMatrix();
};

const createTree = () => new Tree(scene);

const setupScene = () => {
  scene = createScene();
  camera = createCamera(Constants.WIDTH / Constants.HEIGHT);
  renderer = createRenderer();

  //Alles in class steken die te maken heeft met Three?
  controls = new THREE.OrbitControls(camera, document.querySelector(`.world`));
  controls.autoRotate = true;
  controls.keys = {
    LEFT: 37, //left arrow
    UP: 38, // up arrow
    RIGHT: 39, // right arrow
    BOTTOM: 40 // down arrow
  };

  window.addEventListener(`resize`, handleWindowResize, false);

  createLights(scene);
};

const loop = () => {
  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(loop);
};

const getKeyCodeData = keyCode => {
  return Constants.KEY_NOTE_FREQUENCY.filter(d => d.keyCode === keyCode)[0];
};

const handleOnResetButtonClick = () => {
  while (scene.children.length > 0) {
    scene.children[0].children.forEach(c => {
      c.material.dispose();
      c.geometry.dispose();
    });

    scene.remove(scene.children[0]);
  }
  // scene.children.forEach(child => {
  //
  //   child.children.forEach(c => {
  //     c.material.dispose();
  //     c.geometry.dispose();
  //   });
  //
  //   scene.remove(child);
  // });
};

const init = () => {

  synth = createSynth();

  setupScene();
  createTree();


  window.addEventListener(`keydown`, ({keyCode}) => handleControllerKeyDown(getKeyCodeData(keyCode)));
  window.addEventListener(`keyup`, ({keyCode}) => handleControllerKeyUp(getKeyCodeData(keyCode)));

  const $resetButton = document.querySelector(`.reset-button`);
  $resetButton.addEventListener(`click`, handleOnResetButtonClick);

  getMIDIAccess();

  loop();

  camera.position;

};

init();
