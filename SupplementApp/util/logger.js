import * as FileSystem from 'expo-file-system';

const LOG_FILE_PATH = FileSystem.documentDirectory + 'app.log';

// helper to append text to file
async function writeToFile(message) {
  try {
    // Read the current file (if it exists)
    let existing = '';
    try {
      existing = await FileSystem.readAsStringAsync(LOG_FILE_PATH);
    } catch {
      existing = '';
    }

    // Append the new message
    const updated = existing + message + '\n';

    // Write the combined content back
    await FileSystem.writeAsStringAsync(
      LOG_FILE_PATH,
      updated,
      { encoding: FileSystem.EncodingType.UTF8 }
    );
  } catch (error) {
    console.warn('Failed to write log:', error);
  }
}

function formatLogMessage(level, args) {
  const timestamp = new Date().toISOString();
  const msg = args.map(a => 
    typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
  ).join(' ');
  return `[${timestamp}] [${level.toUpperCase()}] ${msg}`;
}

// patch console methods
export function setupFileLogger() {
  ['log', 'warn', 'error'].forEach(level => {
    const original = console[level];
    console[level] = (...args) => {
      const message = formatLogMessage(level, args);
      original(...args);              // still show in dev console
      writeToFile(message);           // persist to file
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