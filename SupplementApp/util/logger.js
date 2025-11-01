import * as FileSystem from 'expo-file-system';

const LOG_FILE_PATH = FileSystem.documentDirectory + 'app.log';
const MAX_LOG_SIZE = 200_000; // bytes (~200 KB). Adjust as needed.

async function writeToFile(message) {
  try {
    // Append message efficiently
    await FileSystem.writeAsStringAsync(LOG_FILE_PATH, message + '\n', {
      encoding: FileSystem.EncodingType.UTF8,
      append: true,
    });

    // Check file size occasionally (every 20 writes)
    checkAndTrimLogs();
  } catch (error) {
    console.warn('Failed to write log:', error);
  }
}

// Keep track of how many writes since last trim check
let writeCount = 0;
async function checkAndTrimLogs() {
  writeCount++;
  if (writeCount % 20 !== 0) return; // Only check occasionally to reduce I/O

  try {
    const info = await FileSystem.getInfoAsync(LOG_FILE_PATH);
    if (info.exists && info.size > MAX_LOG_SIZE * 1.1) {
      // Read last portion and overwrite file
      const content = await FileSystem.readAsStringAsync(LOG_FILE_PATH, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const trimmed = content.slice(-MAX_LOG_SIZE);
      await FileSystem.writeAsStringAsync(LOG_FILE_PATH, trimmed, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      console.log('🧹 Trimmed log file (kept last ~200KB)');
    }
  } catch (e) {
    console.warn('Failed to trim logs:', e);
  }
}

function formatLogMessage(level, args) {
  const timestamp = new Date().toISOString();
  const msg = args
    .map((a) =>
      typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
    )
    .join(' ');
  return `[${timestamp}] [${level.toUpperCase()}] ${msg}`;
}

// Patch console methods
export function setupFileLogger() {
  ['log', 'warn', 'error'].forEach((level) => {
    const original = console[level];
    console[level] = (...args) => {
      const message = formatLogMessage(level, args);
      original(...args); // still show in dev console
      writeToFile(message); // persist to file
    };
  });

  console.log(`📄 Logging to file: ${LOG_FILE_PATH}`);
}

export async function readLogs() {
  try {
    return await FileSystem.readAsStringAsync(LOG_FILE_PATH);
  } catch {
    return 'No logs found.';
  }
}

export async function clearLogs() {
  try {
    await FileSystem.deleteAsync(LOG_FILE_PATH);
    console.log('Logs cleared');
  } catch (e) {
    console.error('Failed to clear logs:', e);
  }
}

export { LOG_FILE_PATH };
