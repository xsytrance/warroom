--
-- Phase 5: Add agent-authored posts support
-- This migration makes Post.authorId optional and adds Post.authorAgentId
-- to allow posts to be authored by either a User or an Agent.
--

-- 1. Create new Post table with updated schema
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT,
    "authorAgentId" TEXT,
    "roomId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'human_broadcast',
    "title" TEXT,
    "body" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "linkUrl" TEXT,
    "metadataJson" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Post_authorAgentId_fkey" FOREIGN KEY ("authorAgentId") REFERENCES "Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Post_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 2. Copy existing data (authorAgentId will be NULL for all existing posts)
INSERT INTO "new_Post" ("id", "authorId", "authorAgentId", "roomId", "type", "title", "body", "mediaUrl", "mediaType", "linkUrl", "metadataJson", "priority", "createdAt", "updatedAt")
SELECT "id", "authorId", NULL, "roomId", "type", "title", "body", "mediaUrl", "mediaType", "linkUrl", "metadataJson", "priority", "createdAt", "updatedAt"
FROM "Post";

-- 3. Drop old Post table
DROP TABLE "Post";

-- 4. Rename new table
ALTER TABLE "new_Post" RENAME TO "Post";

-- 5. Recreate indices
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
CREATE INDEX "Post_authorAgentId_idx" ON "Post"("authorAgentId");
CREATE INDEX "Post_roomId_idx" ON "Post"("roomId");

-- 6. Recreate Comment foreign key (it references Post which was dropped)
-- SQLite handles this automatically through the foreign key constraints
-- but we verify the schema is consistent.
