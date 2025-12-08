export class UserEntity {
  id: string;
  email: string;
  password?: string
  role: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
