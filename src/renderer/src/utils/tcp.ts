export const tcpParser = (data: string, identifier: string, interceptor: number): string[] => {
  if (data.startsWith(`#${identifier}`)) {
    const segments = data.split(";").slice(1, -1);
    const result: string[] = [];

    for (let i = 0; i < segments.length; i++) {
      const keyValue = segments[i].split(':');
      result.push(keyValue[interceptor]);
    }

    return result;
  }

  return [];
}