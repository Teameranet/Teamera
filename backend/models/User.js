import { randomUUID } from 'crypto';

class User {
  constructor(data) {
    this.id = data.id || randomUUID();
    this.name = data.name;
    this.email = data.email;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  update(data) {
    if (data.name) this.name = data.name;
    if (data.email) this.email = data.email;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  static validate(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static create(data) {
    return new User(data);
  }
}

export default User;
