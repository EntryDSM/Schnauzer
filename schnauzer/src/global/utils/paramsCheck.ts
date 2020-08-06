export default (params: any[]) =>
  Boolean(params.filter((v) => v == null).length);
