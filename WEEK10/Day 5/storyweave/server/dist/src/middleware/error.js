"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function notFound(req, res) {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({ errors: err.issues.map((i) => i.message) });
    }
    if (err instanceof Error) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
    return res.status(500).json({ error: "Unknown error" });
}
