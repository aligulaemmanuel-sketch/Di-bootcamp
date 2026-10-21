"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRole = getRole;
exports.canEdit = canEdit;
exports.canModerate = canModerate;
exports.canRead = canRead;
const prisma_1 = require("./prisma");
async function getRole(userId, storyId) {
    const row = await prisma_1.prisma.storyCollaborator.findUnique({
        where: { storyId_userId: { storyId, userId } },
    });
    return row?.role ?? null;
}
function canEdit(role) {
    return role === "OWNER" || role === "EDITOR";
}
function canModerate(role) {
    return role === "OWNER";
}
/** True when the user may read the story: collaborator, or any logged-in user
 *  (stories are readable inside the app; share links work without login). */
function canRead(role) {
    return role !== null;
}
