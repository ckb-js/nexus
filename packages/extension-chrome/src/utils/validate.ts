/**
 * Validate if a string is a valid host, including hostname and IP address
 * @param host
 */
export function validateHost(host: string): void {
  const url = new URL(`http://${host}`);
  if (`http://${host}/` !== url.href) {
    throw new Error(`Invalid host:  ${host}`);
  }
}
