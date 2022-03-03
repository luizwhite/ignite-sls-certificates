import { existsSync as fsExistsSync, mkdirSync as fsMkdirSync } from 'fs';
import { dirname as pathDirname } from 'path';

const ensureDirectoryExistence = (filePath: string): void => {
  const dirName = pathDirname(filePath);

  if (!fsExistsSync(dirName)) fsMkdirSync(dirName, { recursive: true });
};

export { ensureDirectoryExistence };
