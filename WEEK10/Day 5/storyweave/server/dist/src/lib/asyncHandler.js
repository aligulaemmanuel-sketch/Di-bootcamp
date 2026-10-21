"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ah = void 0;
const ah = (fn) => (req, res, next) => {
    fn(req, res, next).catch(next);
};
exports.ah = ah;
