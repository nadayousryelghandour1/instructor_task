export function fileExtension(name = "") {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

// Returns a message when the file should be refused, or "" when it is fine.
export function validateFile(file, { extensions, maxMb }) {
  if (!extensions.includes(fileExtension(file.name))) {
    const list = extensions.map((ext) => ext.slice(1).toUpperCase()).join(", ");
    return `Only ${list} files are supported`;
  }
  if (file.size === 0) return "The file is empty";
  if (file.size > maxMb * 1024 * 1024) return `The file is larger than ${maxMb} MB`;
  return "";
}
