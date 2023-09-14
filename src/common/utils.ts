import * as bcrypt from 'bcrypt';

// compare the password
export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export interface BaseResponse {
  message: string;
  status: number;
  result: Object;
}
