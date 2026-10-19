import {randomUUID} from 'node:crypto';
import {mkdirSync} from 'node:fs';
import {unlink} from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import {HttpError} from '../auth.ts';

/** Winter Arc attachments: one optional file per entry (pitch, sketch, doc), up to 10 MB, kept in backend/uploads/arc. */
export const ARC_UPLOAD_DIR = path.resolve(import.meta.dirname, '../../uploads/arc');
mkdirSync(ARC_UPLOAD_DIR, {recursive: true});

const FILE_TYPES = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.webp', '.zip'];

export const arcUpload = multer({
  storage: multer.diskStorage({
    destination: ARC_UPLOAD_DIR,
    // A random name on disk; the original name is kept in the table for downloads
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: {fileSize: 10 * 1024 * 1024, files: 1},
  fileFilter: (_req, file, cb) => {
    if (FILE_TYPES.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new HttpError(400, "That file type isn't allowed. Use PDF, PPT, Word, TXT, an image or ZIP."));
  },
});

export const removeArcFile = (stored: string | null | undefined) =>
  stored ? unlink(path.join(ARC_UPLOAD_DIR, path.basename(stored))).catch(() => {}) : Promise.resolve();
