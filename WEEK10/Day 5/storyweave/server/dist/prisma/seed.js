"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.commentReaction.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.storyVersion.deleteMany();
    await prisma.storyCollaborator.deleteMany();
    await prisma.story.deleteMany();
    await prisma.user.deleteMany();
    const hash = await bcryptjs_1.default.hash("passw0rd!", 10);
    const sara = await prisma.user.create({
        data: { email: "sara@example.com", username: "sara_writes", passwordHash: hash,
            bio: "Fantasy novelist by night, dev by day.", avatarUrl: "https://i.pravatar.cc/150?img=47" },
    });
    const leo = await prisma.user.create({
        data: { email: "leo@example.com", username: "leo_pens", passwordHash: hash,
            bio: "Short stories and sci-fi.", avatarUrl: "https://i.pravatar.cc/150?img=12" },
    });
    const story = await prisma.story.create({
        data: {
            title: "The Lighthouse at the Edge of Time",
            content: "Chapter One\n\nThe lighthouse had been abandoned for sixty years, yet every night " +
                "the lamp still turned. Mara had come to find out why.\n\nThe door was unlocked.",
            genre: "Fantasy",
            authorId: sara.id,
            collaborators: { create: [{ userId: sara.id, role: "OWNER" }, { userId: leo.id, role: "EDITOR" }] },
            versions: {
                create: [
                    { versionNumber: 1, title: "The Lighthouse at the Edge of Time",
                        content: "Chapter One\n\nThe lighthouse had been abandoned for sixty years.",
                        label: "First draft", savedById: sara.id },
                    { versionNumber: 2, title: "The Lighthouse at the Edge of Time",
                        content: "Chapter One\n\nThe lighthouse had been abandoned for sixty years, yet every night " +
                            "the lamp still turned. Mara had come to find out why.",
                        label: "Added Mara's arrival", savedById: sara.id },
                ],
            },
        },
    });
    const comment = await prisma.comment.create({
        data: {
            storyId: story.id,
            authorId: leo.id,
            content: "The unlocked door detail is perfect — instant hook.",
        },
    });
    await prisma.commentReaction.create({
        data: { commentId: comment.id, userId: sara.id, emoji: "❤️" },
    });
    console.log("Seeded: sara@example.com / leo@example.com (password: passw0rd!)");
}
main().catch(console.error).finally(() => prisma.$disconnect());
