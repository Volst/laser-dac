// If I was good at TypeScript I would not properly return `func` as a typed function, but yeah no
export function throttle(
  this: any,
  func: (...args: any) => void,
  limit: number
): (...args: any) => void {
  let inThrottle: boolean;
  const context = this;
  return function () {
    const args = arguments;
    if (!inThrottle) {
      func.apply(context, args as any);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
