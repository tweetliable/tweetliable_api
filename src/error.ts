export class MyError {
  status: number;
  msg: string;

  constructor(status: number, msg: string) {
    this.status = status;
    this.msg = msg;
  }
}

export const error = (status: number, msg: string) => {
  let err = new MyError(status, msg);
  return err;
};
