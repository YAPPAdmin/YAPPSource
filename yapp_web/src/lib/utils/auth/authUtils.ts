
type PasswordValidationResult = {
    passwordLength: boolean;
    passwordLowercase: boolean;
    passwordUppercase: boolean;
    passwordNumbers: boolean;
    passwordSpecialChar: boolean;
    passwordContainsOnlyAllowedChars: boolean;
    passwordComplexity: boolean;
};

/**
 * Validates a password based on specific criteria.
 * The password must be at least 8 characters long, contain at least one number,
 * one lowercase letter, one uppercase letter, and only allowed special characters.
 * @param password The password string to validate.
 * @returns `true` if the password meets all criteria, otherwise `false`.
 */
export function validatePassword(password: string): PasswordValidationResult {
    // Password allowed special characters
    const allowedSpecialChars = "@!\\\"§$%&/()=?{}[]#+-*~|;:,.<>€£¥öäüÖÄÜ";

    const escapedSpecialChars = allowedSpecialChars.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const allowedCharsPattern = new RegExp(`^[a-zA-Z0-9${escapedSpecialChars}]+$`);
    const specialCharPattern = new RegExp(`[${escapedSpecialChars}]`);

    // Password Length
    const passwordLength = password.length >= 8;
    
    // Password contains lowercase
    const passwordLowercase = /[a-z]/.test(password);
    
    // Password contains Uppercase
    const passwordUppercase = /[A-Z]/.test(password);
    
    // Password contains Numbers
    const passwordNumbers = /[0-9]/.test(password);
    
    // Password contains Special Charaters
    const passwordSpecialChar = specialCharPattern.test(password);
    
    // Password contains only allowed special characters
    const passwordContainsOnlyAllowedChars = allowedCharsPattern.test(password);

    // Password complexity result
    const passwordComplexity = passwordLength && passwordLowercase && passwordUppercase && passwordNumbers && passwordContainsOnlyAllowedChars;

    const result: PasswordValidationResult = {
        passwordLength: passwordLength,
        passwordLowercase: passwordLowercase,
        passwordUppercase: passwordUppercase,
        passwordNumbers: passwordNumbers,
        passwordSpecialChar: passwordSpecialChar,
        passwordContainsOnlyAllowedChars: passwordContainsOnlyAllowedChars,
        passwordComplexity: passwordComplexity,
    };

    return result;
}

/**
 * Validates a username to ensure it contains only alphanumeric characters.
 * @param username The username string to validate.
 * @returns `true` if the username contains only alphanumeric characters, otherwise `false`.
 */
export function validateUserName(username: string): boolean {
    const re = /^[a-zA-Z0-9 ]+$/;
    return re.test(username);
}

/**
 * Validates an email address format.
 * @param email The email string to validate.
 * @returns `true` if the email format is valid, otherwise `false`.
 */
export function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validates an date for a birthday
 * @param dateInput The Birthday date to validate
 * @returns `true` if the birthdate is valid and realistic
 */
export function validateBirthdate(dateInput: string): boolean {

    const birthdate = new Date(dateInput);
    const today = new Date();

    // Check if date is valid
    if (isNaN(birthdate.getTime())) {
        return false;
    }

    // Check if date is in the future
    if (birthdate > today) {
        return false;
    }

    // Calculate age
    const age = today.getFullYear() - birthdate.getFullYear();
    const hasHadBirthdayThisYear =
        today.getMonth() > birthdate.getMonth() ||
        (today.getMonth() === birthdate.getMonth() && today.getDate() >= birthdate.getDate());

    const realAge = hasHadBirthdayThisYear ? age : age - 1;

    if (realAge < 0 || realAge > 130) {
        return false;
    }

    return true; // Valid birthdate
}


