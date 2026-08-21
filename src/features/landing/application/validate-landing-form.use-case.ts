const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\+]?[0-9\s\-\(\)]{10,}$/;

export class ValidateLandingFormUseCase {
  execute(body: { name?: string; email?: string; phone?: string; company?: string }): string[] {
    const { name, email, phone, company } = body;
    const errors: string[] = [];

    if (!name || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!email) {
      errors.push('Email is required');
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push('Invalid email format');
    }

    if (phone && phone.trim()) {
      if (!PHONE_REGEX.test(phone.trim())) {
        errors.push('Invalid phone format');
      }
    }

    if (company && company.trim().length < 2) {
      errors.push('Company name must be at least 2 characters long');
    }

    return errors;
  }
}
