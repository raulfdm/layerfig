import fs from 'node:fs';
import { z } from 'zod';

import type { Result } from './types.ts';

export function readIfExist(filePath: string): Result<string, string> {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const fileContentResult = z.string().safeParse(fileContent);

    if (fileContentResult.success) {
      return {
        ok: true,
        data: fileContentResult.data,
      };
    } else {
      return {
        ok: false,
        error: 'File content is not a string.',
      };
    }
  }

  return {
    ok: false,
    error: `File "${filePath}" does not exist`,
  };
}
