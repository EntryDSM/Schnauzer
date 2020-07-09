export class ErrorResponse extends Error {
  public status: number;
  public code: string;
  public message: string;

  constructor(status: number, code: string, message: string) {
    super();
    this.message = message;
    this.status = status;
    this.code = code;
  }
}
