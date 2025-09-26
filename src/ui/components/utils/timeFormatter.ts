export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remSeconds = seconds % 60;
  const milliseconds = ms % 1000;
  return `${minutes}:${remSeconds < 10 ? '0' : ''}${remSeconds}.${Math.floor(
    milliseconds / 100
  )}`;
};