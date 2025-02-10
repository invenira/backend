class CurrentUser {
  private user: string;

  get(): string {
    return this.user;
  }

  set(user: string) {
    this.user = user;
  }
}

const currentUser = new CurrentUser();

export function setCurrentUser(user: string) {
  currentUser.set(user);
}

export function getCurrentUser() {
  return currentUser.get();
}
