export class TestHookDto {
  constructor(obj: Partial<TestHookDto>) {
    Object.assign(this, obj);
  }

  type: string;
  status: string;
  data: {
    challenge: string;
  };
}
