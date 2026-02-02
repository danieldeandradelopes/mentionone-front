import { EnterpriseAuthentication } from "./Authentication";
import Phone from "./Phone";
import User from "./User";

export interface UserSessionProps {
  user: User;
  Enterprise?: EnterpriseAuthentication | null;
  phones?: Phone[] | null;
  onboarding_completed_at?: string | null;
}

export default class UserSession {
  readonly user: User;
  readonly Enterprise?: EnterpriseAuthentication | null;
  readonly phones?: Phone[] | null;
  readonly onboarding_completed_at?: string | null;

  constructor({ user, Enterprise, phones, onboarding_completed_at }: UserSessionProps) {
    this.user = user;
    this.Enterprise = Enterprise;
    this.phones = phones;
    this.onboarding_completed_at = onboarding_completed_at ?? null;
  }
}
