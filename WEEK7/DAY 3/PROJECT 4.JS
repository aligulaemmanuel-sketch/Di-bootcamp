const fs = require('fs');
const _ = require('lodash');
const yargs = require('yargs');

// --- DATA LOGIC SECTION (Formerly notes.js) ---

const fetchNotes = () => {
  try {
    const notesString = fs.readFileSync('notes-data.json');
    return JSON.parse(notesString);
  } catch (e) {
    return [];
  }
};

const saveNotes = (notes) => {
  fs.writeFileSync('notes-data.json', JSON.stringify(notes));
};

const addNote = (title, body) => {
  let notes = fetchNotes();
  let note = { title, body };
  let duplicateNotes = notes.filter((n) => n.title === title);

  if (duplicateNotes.length === 0) {
    notes.push(note);
    saveNotes(notes);
    return note;
  }
};

const getAll = () => {
  return fetchNotes();
};

const getNote = (title) => {
  let notes = fetchNotes();
  let filteredNotes = notes.filter((n) => n.title === title);
  return filteredNotes[0];
};

const removeNote = (title) => {
  let notes = fetchNotes();
  let filteredNotes = notes.filter((n) => n.title !== title);
  saveNotes(filteredNotes);
  return notes.length !== filteredNotes.length;
};

// --- COMMAND LINE SECTION ---

const argv = yargs.argv;
const command = argv._[0]; // Lodash style argument access

if (command === 'add') {
  const note = addNote(argv.title, argv.body);
  if (note) {
    console.log('Note created successfully!');
    console.log(`Title: ${note.title}`);
  } else {
    console.log('Note already exists');
  }

} else if (command === 'list') {
  const allNotes = getAll();
  console.log(`Printing ${allNotes.length} note(s).`);
  allNotes.forEach((note) => console.log(`Title: ${note.title}, Body: ${note.body}`));

} else if (command === 'read') {
  const note = getNote(argv.title);
  if (note) {
    console.log('Note found');
    console.log(`Title: ${note.title} | Body: ${note.body}`);
  } else {
    console.log('Note not found');
  }

} else if (command === 'remove') {
  const noteRemoved = removeNote(argv.title);
  console.log(noteRemoved ? 'Note was removed' : 'Note not found');

} else {
  console.log('command not recognized');
}