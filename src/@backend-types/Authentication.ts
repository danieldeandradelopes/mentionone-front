import Phone from "./Phone";
import User from "./User";

export interface EnterpriseAuthentication {
  id: number;
  name: string;
  cover?: string;
  address?: string;
  description?: string;
  phones?: Phone[];
  created_at?: Date;
  updated_at?: Date;
}

export default class Authentication {
  constructor(
    readonly user: User,
    readonly token: string,
    readonly Enterprise?: EnterpriseAuthentication | null,
    readonly phones?: Phone[] | null,
    readonly refreshToken?: string | null
  ) {}
}
