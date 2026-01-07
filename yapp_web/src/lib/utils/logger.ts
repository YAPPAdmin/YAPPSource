import { dev } from "$app/environment";
import { SurrealDB } from "$lib/database/surrealdb"
import { red, yellow, cyan, magenta, green, bold, whiteBright,  } from "colorette"

export enum LogLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    CRIT = "CRIT",
    SECURITY = "SECURITY"
}

export interface LogEntry {
    id?: string;
    level: LogLevel;
    source: string;
    timestamp: string;
    error?: string
    message?: string;
    context?: Record<string, any>;
    user?: {
        id: string;
        email?: string;
    };
    [key: string]: unknown;
    raw?: string;
    
}

export class Logger {
    static async log(level: LogLevel, source: string, error: string, message: string, context: Record<string, any> = {}, user?: {id: string, email?: string}, raw?: string, silent: boolean = false) {

        const entry: LogEntry = {
            level: level,
            source: source,
            timestamp: new Date().toISOString(),
            error: error,
            message: message,
            context: context,
            user: user,
            raw: raw,
        }

        const messageStr = entry.message ? `\n${(bold(whiteBright("MESSAGE:").padStart(27)))} ${String(entry.message)}` : "";
        // const userStr = entry.user ?        `\n${JSON.stringify(entry.user).padStart(20)}` : "";
        // const contextStr = entry.context ?  `\n${JSON.stringify(entry.context, null, 2).padStart(20)}` : "";

        const hasContext = entry.context && Object.keys(entry.context).length > 0;
        const contextStr = hasContext
            ? `\n${bold(whiteBright("CONTEXT:").padStart(27))} ` +
            Object.entries(entry.context!)
                .map(([k,v]) => `${k}=${v}`)
                .join(", ")
            : "";

        const hasUser = entry.user && Object.keys(entry.user).length > 0;
        const userStr = hasUser
            ? `\n${(bold(whiteBright("USER:").padStart(27)))} ${JSON.stringify(entry.user).padStart(20)}`
            : "";

        const rawStr = entry.raw ? `\n${bold(whiteBright("RAW:").padStart(26))} ${String(entry.raw)}` : ""

        // Persist in SurrealDB
        try {
            await SurrealDB.writeLog(entry)
        } catch (err) {
            console.error(bold(red("[LOGGER] Failed to persist log:")), err)
        }

        if(silent) return;

        // Critical
        if(level == LogLevel.CRIT) {
            console.error(
                `${bold(green("[LOGGER]"))} ${entry.timestamp.padEnd(4)} ${bold(magenta(entry.level))} ${bold(cyan(entry.source))} ${bold(magenta(error.padEnd(10)))}:` + messageStr + userStr + contextStr + rawStr + "\n"
            )

        // Error/Security
        } else if(level == LogLevel.ERROR || level ==LogLevel.SECURITY ) {
            console.error(
                `${bold(green("[LOGGER]"))} ${entry.timestamp.padEnd(4)} ${bold(red(entry.level))} ${bold(cyan(entry.source))} ${bold(red(error.padEnd(10)))}:` + messageStr + userStr + contextStr + rawStr + "\n"
            )

        // Warning
        } else if(level == LogLevel.WARN && dev) {
            console.error(
                `${bold(green("[LOGGER]"))} ${entry.timestamp.padEnd(4)} ${bold(yellow(entry.level))} ${bold(cyan(entry.source))} ${bold(yellow(error.padEnd(10)))}:` + messageStr + userStr + contextStr + rawStr + "\n"
            )
        
        // Info
        } else if(level == LogLevel.INFO && dev) {
            console.log(
                `${bold(green("[LOGGER]"))} ${entry.timestamp.padEnd(4)} ${bold(green(entry.level.padEnd(8)))} ${bold(cyan(entry.source))} ` + messageStr + userStr + contextStr + rawStr + "\n"
            )
        }


    }

    static info(source: string, message: string, context?: Record<string, any>, user?: {id: string, email?: string}, raw?: string, silent: boolean = false) {
        return this.log(LogLevel.INFO, source, "", message, context, user, raw, silent)
    }

    static warn(source: string, error: string, message: string, context?: Record<string, any>, user?: {id: string, email?: string}, raw?: string, silent: boolean = false) {
        return this.log(LogLevel.WARN, source, error, message, context, user, raw, silent)
    }

    static error(source: string, error: string,message: string, context?: Record<string, any>, user?: {id: string, email?: string}, raw?: string, silent: boolean = false) {
        return this.log(LogLevel.ERROR, source, error, message, context, user, raw, silent)
    }

    static crit(source: string, error: string, message: string, context?: Record<string, any>, user?: {id: string, email?: string}, raw?: string, silent: boolean = false) {
        return this.log(LogLevel.CRIT, source, error, message, context, user, raw, silent)
    }

    static security(source: string, error: string, message: string, context?: Record<string, any>, user?: {id: string, email?: string}, raw?: string, silent: boolean = false) {
        return this.log(LogLevel.SECURITY, source, error, message, context, user, raw, silent)
    }

    static async populateDB(count: number = 50) {
        const startTime = Date.now();

        const concurrency = 100;

        const allTasks: (() => Promise<void>)[] = [];

        for(let i = 0; i < count; i++) {
            const level = pick(Object.values(LogLevel));
            const message = pick(MESSAGES[level]);
            const source = pick(SOURCES);
            const user = pick(USERS);
            const context = {
                ip: `192.168.0.${Math.floor(Math.random() * 255)}`,
            }

            allTasks.push(() => 
                Logger.log(
                    level,
                    source,
                    level === LogLevel.ERROR || level === LogLevel.CRIT ? "ErrorCode-" + Math.floor(Math.random() * 9999) : "",
                    message,
                    context,
                    user,
                    level === LogLevel.SECURITY ? "Suspicious activity detected" : undefined,
                    true,
                )
            );
        }

        for(let i = 0; i < allTasks.length; i += concurrency) {
            const chunk = allTasks.slice(i, i + concurrency).map(fn => fn());
            await Promise.all(chunk)
        }

        const endTime = Date.now()

        console.log(`Logs filled in ${endTime-startTime} ms`)
    }

}

// Helper function
function randomTimestamp() {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - 30);
    const ts = new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
    return ts.toISOString();
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

const SOURCES = ["AUTH", "DB", "API", "SYSTEM", "UI", "WORKER"];

// Possible messages for each log level
const MESSAGES: Record<LogLevel, string[]> = {
    [LogLevel.INFO]: [
        "User signed in successfully",
        "Background job completed",
        "Cache refreshed",
        "API request handled",
        "Profile updated",
        "System health check passed",
    ],
    [LogLevel.WARN]: [
        "High memory usage detected",
        "Slow query execution",
        "User attempted deprecated API",
        "Retrying failed request",
        "Unusual login location detected",
    ],
    [LogLevel.ERROR]: [
        "Failed to connect to database",
        "Email sending failed",
        "Unhandled exception occurred",
        "External API request timed out",
        "Payment gateway error",
    ],
    [LogLevel.CRIT]: [
        "Database corruption detected",
        "Filesystem is out of space",
        "Cluster node unreachable",
        "Kernel panic reported",
    ],
    [LogLevel.SECURITY]: [
        "Multiple failed login attempts",
        "SQL injection attempt blocked",
        "Unauthorized access detected",
        "Token tampering prevented",
        "User escalation attempt stopped",
    ],
};

// Fake users
const USERS = [
    { id: "user:1", email: "alice@example.com" },
    { id: "user:2", email: "bob@example.com" },
    { id: "user:3", email: "charlie@example.com" },
    { id: "user:4", email: "eve@example.com" },
    undefined, // some logs may have no user context
];