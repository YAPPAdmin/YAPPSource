import { User } from "./auth/User";


// Color Type
export type colorVariantsFull = "primary" | "secondary" | "tertiary" | "highlight" | "background" | "success" | "warning" | "error";
export type colorVariants = "primary" | "secondary" | "tertiary" | "highlight" | "background";


/**
 * Checks if input string is a valid URL.
 *
 * @param str - The string to test
 * @returns true if the string is a valid URL, false otherwise
 */
export function isValidUrl(str: string): boolean {
    try {
        new URL(str); //URL(<input>) will throw an error if input is not a string
        return true;
    } catch (_) {
        return false;
    }
}

export async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read as file and convert to string"));
        reader.readAsDataURL(file)
    })
}

/**
 * Formats a given date according to specified options.
 *
 * @param {string | Date} date - The date to be formatted. Can be a string or a Date object.
 * @param {"numeric" | "2-digit" | undefined} [year="numeric"] - The format of the year.
 * @param {"numeric" | "2-digit" | "long" | "short" | "narrow" | undefined} [month="long"] - The format of the month.
 * @param {"numeric" | "2-digit" | undefined} [day="numeric"] - The format of the day.
 * @param {"numeric" | "2-digit" | undefined} [hour="2-digit"] - The format of the hour.
 * @param {"numeric" | "2-digit" | undefined} [minute="2-digit"] - The format of the minute.
 * @param {"numeric" | "2-digit" | undefined} [second="2-digit"] - The format of the second.
 * @param {boolean} [hour12=false] - Whether to use 12-hour time (as opposed to 24-hour time).
 * @returns {string} The formatted date string.
 */
export function formatDate(
    date: string | Date,
    year:  "numeric" | "2-digit" | undefined = "numeric",
    month: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined = "long",
    day:   "numeric" | "2-digit" | undefined = "numeric",
    locale: string | undefined = undefined,
    timeZone: string | undefined = undefined
): string|any {

    try{
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
            throw new Error("Invalid date provided");
        }

        const options: Intl.DateTimeFormatOptions = {
            year,
            month,
            day,
            timeZone,
        };

        return dateObj.toLocaleDateString(locale, options);
    } catch (error) {
        console.log(`Error formating date " ${date} ":` , error);
        return date;
    }
    
}

export function formatTime(
    date: string | Date,
    hour:   "numeric" | "2-digit" | undefined = "2-digit",
    minute: "numeric" | "2-digit" | undefined = "2-digit",
    second: "numeric" | "2-digit" | undefined = undefined,
    hour12: boolean = false,
    timeZone = "UTC"
): string|any {

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
            throw new Error("Invalid date provided");
        }

        const options: Intl.DateTimeFormatOptions = {
            hour,
            minute,
            second,
            hour12,
            timeZone,
        };

        return dateObj.toLocaleTimeString(undefined, options);
        
    } catch (error) {
        console.log(`Error formating time " ${date} ":` , error);
        return date;
    }
}

/**
 * 
 * @param bytes 
 */
export function formatByte(bytes: number, decimals: number = 2, append: boolean = true) {
    if(!bytes || bytes == 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    const result = append ? parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i] : parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
 
    return result;
}

/**
 * Returns a given date to the day only, removing time
 * 
 * @param iso date 
 * @returns Day
 */
export function getDayFromDate(input: string | Date): string {
    const date = input instanceof Date ? input : new Date(input);
    return date.toISOString().split("T")[0];
}

export function getTimeFromDate(input: string | Date): string {
    const date = input instanceof Date ? input : new Date(input);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Closes an Element when clicked outside of it
 * 
 * @param node 
 * @returns destroys the element
 */
export function clickOutside(node: any) {

    const handleClick = event => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            node.dispatchEvent(
                new CustomEvent('click_outside', node)
            )
        }
    }

    document.addEventListener('click', handleClick, true);
    
    return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
            }
    }
}
