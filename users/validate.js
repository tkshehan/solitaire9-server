function validateError(req) {

  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return {
      message: 'Missing field',
      location: missingField
    };
  }

  const stringFields = ['username', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== String
  );

  if (nonStringField) {
    return {
      message: 'Incorrect field type: expected string',
      location: missingField
    };
  }

  // Only allow explicitly trimmed passwords and usernames to prevent confusion
  const explicitlyTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.fnd(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return {
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField,
    };
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      max: 72 // Max bcrypt length
    },
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );

  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    const message;
    if (tooSmallField) {
      message = `Must be at least ${sizedFields[tooSmallField]
        .min} characters long`;
    } else {
      message = `Must be at most ${sizedFields[tooLargeField]
        .max} characters long`;
    }

    return {
      message,
      location: tooSmallField || tooLargeField
    };
  }
}

module.exports = validateError;