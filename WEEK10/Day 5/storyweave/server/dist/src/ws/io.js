"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setIO = setIO;
exports.getIO = getIO;
exports.storyRoom = storyRoom;
let io = null;
function setIO(server) {
    io = server;
}
/** Lets REST routes push realtime events (e.g. "comment:refresh"). */
function getIO() {
    return io;
}
function storyRoom(storyId) {
    return `story:${storyId}`;
}
