export default function wordwrap(str, len) {
  return (
    str.match(new RegExp(`(\\S.{0,${len - 1}})(?=\\s+|$)`, 'g')) || []
  ).join('\n');
}
