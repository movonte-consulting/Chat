export class GetLandingFormFieldsUseCase {
  execute() {
    return {
      required: ['name', 'email'],
      optional: ['phone', 'company', 'message'],
      validation: {
        name: {
          minLength: 2,
          maxLength: 100,
          description: 'Full name of the contact'
        },
        email: {
          pattern: 'email',
          description: 'Valid email address'
        },
        phone: {
          pattern: 'phone',
          description: 'Phone number (optional)',
          example: '+1 (555) 123-4567'
        },
        company: {
          minLength: 2,
          maxLength: 100,
          description: 'Company name (optional)'
        },
        message: {
          maxLength: 1000,
          description: 'Additional message (optional)'
        }
      }
    };
  }
}
