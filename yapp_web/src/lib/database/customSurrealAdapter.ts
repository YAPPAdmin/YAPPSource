/**
 * Custom/Modified SurrealDB Adapter 
 * Small changes to fix small problems:
 * extractId functionn that works with SurrealDB's current ID system
 * 
 * @module @auth/surrealdb-adapter
 */
import Surreal, { ExperimentalSurrealHTTP } from "surrealdb.js"
import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  VerificationToken,
} from "@auth/core/adapters"
import type { ProviderType } from "@auth/core/providers"
import { RecordId, StringRecordId } from "surrealdb"

type Document = Record<string, string | null | undefined> & { id: string }
export type UserDoc = Document & { email: string }
export type AccountDoc<T = string> = {
  id: string
  userId: T
  refresh_token?: string
  access_token?: string
  type: Extract<ProviderType, "oauth" | "oidc" | "email" | "webauthn">
  provider: string
  providerAccountId: string
  expires_at?: number
}
export type SessionDoc<T = string> = Document & { userId: T }


// old
// const extractId = (surrealId: string) =>
//   toId(surrealId.split(":")[1]) ?? surrealId

// modified
/**
 * **MODIFIED**
 * Returns only the id number of a SurrealDB ID
 * @param surrealId
 * @returns 
 */
function extractId(surrealId) {
	// console.log("\nextractId: ", surrealId)
	if(typeof surrealId === "string") {
        const match = surrealId.match(/⟨([^⟩]+)⟩/);

		if(match) {
			return match[1]
		} else {
			console.log("extractId: FAILED: ", surrealId)
			return null;
		}
	} else {
		return  surrealId.id;
	}
}


/** @internal */
// Convert DB object to AdapterUser
export function docToUser<AdapterUser>(doc: UserDoc) {
	// console.log("\ndocToUser: ", doc, doc.id)
	return {
		...doc,
		id: extractId(doc.id),
		emailVerified: doc.emailVerified ? new Date(doc.emailVerified) : null,
	}
}

/** @internal */
// Convert DB object to AdapterAccount
export const docToAccount = (doc: AccountDoc) => {
	// console.log("docToAccount")
	const account: AdapterAccount = {
		...doc,
		id: extractId(doc.id),
		userId: doc.userId ? extractId(doc.userId) : "",
	}
	return account
}

/** @internal */
// Convert DB object to AdapterSession
export const docToSession = (doc: SessionDoc<string | UserDoc>): AdapterSession => ({
	userId: extractId(
		typeof doc.userId === "string" ? doc.userId : doc.userId.id
	),
	expires: new Date(doc.expires ?? ""),
	sessionToken: doc.sessionToken ?? "",
})

/** @internal */
// Convert AdapterUser to DB object
const userToDoc = (user: Omit<AdapterUser, "id"> | Partial<AdapterUser>): Omit<UserDoc, "id"> => {
	// console.log("userToDoc")
	const doc = {
		...user,
		emailVerified: user.emailVerified?.toISOString(),
	}
	return doc
}

/** @internal */
// Convert AdapterAccount to DB object
const accountToDoc = (account: AdapterAccount): Omit<AccountDoc, "id"> => {
    // console.log("\naccountToDoc")
	const doc = {
		...account,
		userId: `user:${toSurrealId(account.userId)}`,
	}
	return doc
}

/** @internal */
// Convert AdapterSession to DB object
export const sessionToDoc = (session: AdapterSession): Omit<SessionDoc, "id"> => {
	const doc = {
		...session,
		expires: session.expires.toISOString(),
	}
	// console.log("sessionToDoc: ", doc)
	return doc
}

export const toSurrealId = (id: string) => {
	if (/^⟨.+⟩$/.test(id)) {
		// console.log("\ntoSurrealId: ", id)
		return id
	} else {
		// console.log("\ntoSurrealId: ", `⟨${id}⟩`)
		return `⟨${id}⟩`
	}
}

export const toId = (surrealId: string) => {
	// console.log("toId: ", surrealId.replace(/^⟨(.+)⟩$/, "$1"))
  	return surrealId.replace(/^⟨(.+)⟩$/, "$1")
}

export function SurrealDBAdapter<T>(client: Promise<Surreal | ExperimentalSurrealHTTP<T>>): Adapter {
	return {

		async createUser(user: Omit<AdapterUser, "id">) {
		// console.log("createUser")
		const surreal = await client
		const doc = userToDoc(user)
		const userDoc = await surreal.create<UserDoc, Omit<UserDoc, "id">>(
			"user",
			doc
		)

			// console.log("\nuserDoc: ", userDoc)

			if (userDoc.length) {
			return docToUser(userDoc[0])
			}
			throw new Error("User not created")
		},

		async getUser(id: string) {
		// console.log("getUser")
		const surreal = await client
		try {
			const surrealId = toSurrealId(id)
			const queryResult = await surreal.query<[UserDoc[]]>(
			"SELECT * FROM $user",
			{
			user: `user:${surrealId}`,
			}
			)
			const doc = queryResult[0]?.[0]
			if (doc) {
			return docToUser(doc)
			}
		} catch {}
		return null
		},

		async getUserByEmail(email: string) {
			// console.log("getUserByEmail")


			const surreal = await client



			try {
				// User Query with email
				const users = await surreal.query<[UserDoc[]]>(
				`SELECT * FROM user WHERE email = $email`, { email }
				)

				// console.log("\ngetUserByEmail: ", users[0]?.[0])
				const doc = users[0]?.[0]
				if (doc) return docToUser(doc)
			} catch {}

			return null
		},

		async getUserByAccount({providerAccountId, provider,}: Pick<AdapterAccount, "provider" | "providerAccountId">) {
			const surreal = await client

			try {
				// Query user
				const users = await surreal.query<[AccountDoc<UserDoc>[]]>(
				`SELECT userId
				FROM account
				WHERE providerAccountId = $providerAccountId
				AND provider = $provider
				FETCH userId`,
				{ providerAccountId, provider }
				)

				const user = users[0]?.[0]?.userId

				if (user) { 
				// console.log("\ngetUserByAccount: ", user)
				return docToUser(user)
				}
			} catch {}
			
			console.error("\ngetUserByAccount: ", null)
			return null
		},

		/**
		 * Updates a user in the database and returns it.
		 * @param user User Update Object, containing ID and changed properties
		 * @returns docToUser(updatedUser)
		 */
		async updateUser(user: Partial<AdapterUser>) {
		if (!user.id) throw new Error("User id is required")
		const surreal = await client;

		// Old function, surreal.merge does not work this way
		// const updatedUser = await surreal.merge<UserDoc, Omit<UserDoc, "id">>(
		// 	`user:${toSurrealId(user.id)}`,
		// 	doc
		// )

		// Format Email Verification Timestamp
		if(user.emailVerified) {
			user.emailVerified = user.emailVerified?.toISOString()
		};

		// Cut UserId from update object
		const { id, ...cutUser } = user;

		// Format new user dict into SurrealQL syntax
		const formatedUser = Object.entries(cutUser)
			.map(([key, value]) => {
				if (typeof value === 'string') {
					return `${key} = '${value}'`;
				} else {
					return `${key} = ${value}`;
				}
			})
			.join(', ');

		// New update function, actually using SurrealDB correctly
		const query = `UPDATE "user:⟨${user.id}⟩" SET ${formatedUser}`
		let updatedUser = await surreal.query(query)

		// Make sure that updatedUser is not passed along as an Array
		let iterations = 0;
		while (Array.isArray(updatedUser) && iterations < 5) {
			updatedUser = updatedUser[0];
			iterations++;
		}

		if (updatedUser) {
			return docToUser(updatedUser)
		} else {
			throw new Error("User not updated")
		}
		},

		async deleteUser(userId: string) {
			const surreal = await client
			const surrealId = toSurrealId(userId)

			// delete account
			try {
			const accounts = await surreal.query<[AccountDoc[]]>(
				`SELECT *
				FROM account
				WHERE userId = $userId
				LIMIT 1`,
				{ userId: `user:${surrealId}` }
			)
			const account = accounts[0]?.[0]
			if (account) {
				const accountId = extractId(account.id)
				await surreal.delete(`account:${accountId}`)
			}
			} catch {}

			// delete session
			try {
			const sessions = await surreal.query<[SessionDoc[]]>(
				`SELECT *
				FROM session
				WHERE userId = $userId
				LIMIT 1`,
				{ userId: `user:${surrealId}` }
			)
			const session = sessions[0]?.[0]
			if (session) {
				const sessionId = extractId(session.id)
				await surreal.delete(`session:${sessionId}`)
			}
			} catch {}

			// delete user
			await surreal.delete(`user:${surrealId}`)

			// TODO: put all 3 deletes inside a Promise all
		},

		async linkAccount(account: AdapterAccount) {
			const surreal = await client
			const doc = await surreal.create("account", accountToDoc(account))
			return docToAccount(doc[0])
		},

		async unlinkAccount({
			providerAccountId,
			provider,
		}: Pick<AdapterAccount, "provider" | "providerAccountId">) {
			const surreal = await client
			try {
			const accounts = await surreal.query<[AccountDoc[]]>(
				`SELECT *
				FROM account
				WHERE providerAccountId = $providerAccountId
				AND provider = $provider
				LIMIT 1`,
				{ providerAccountId, provider }
			)
			const account = accounts[0]?.[0]
			if (account) {
				const accountId = extractId(account.id)
				await surreal.delete(`account:${accountId}`)
			}
			} catch {}
		},

		async createSession({ sessionToken, userId, expires }) {
			const surreal = await client
			const doc = sessionToDoc({
				sessionToken,
				userId: `user:${toSurrealId(userId)}`,
				expires,
			})
			
		const result = await surreal.create<SessionDoc, Omit<SessionDoc, "id">>(
				"session",
				doc
			)

		// console.log("\ncreateSession: ", docToSession(result[0]))
			
		return docToSession(result[0]) ?? null
		},

		async getSessionAndUser(sessionToken: string) {
			const surreal = await client
			try {
			// Can't use limit 1 because it prevent userId to be fetched.
			//   Works setting limit to 2
			const sessions = await surreal.query<[SessionDoc<UserDoc>[]]>(
				`SELECT *
				FROM session
				WHERE sessionToken = $sessionToken
				FETCH userId`,
				{ sessionToken }
			)
			const session = sessions[0]?.[0]
			if (session) {
				const userDoc = session.userId
				if (!userDoc) return null
				return {
				user: docToUser(userDoc),
				session: docToSession({
					...session,
					userId: userDoc.id,
				}),
				}
			}
			} catch {}
			return null
		},

		async updateSession(
			session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
		) {
			const surreal = await client
			try {
			const sessions = await surreal.query<[SessionDoc[]]>(
				`SELECT *
				FROM session
				WHERE sessionToken = $sessionToken
				LIMIT 1`,
				{ sessionToken: session.sessionToken }
			)
			const sessionDoc = sessions[0]?.[0]
			if (sessionDoc && session.expires) {
				const sessionId = extractId(sessionDoc.id)
				const updatedSession = await surreal.merge<
				SessionDoc,
				Omit<SessionDoc, "id">
				>(
				`session:${sessionId}`,
				sessionToDoc({
					...sessionDoc,
					...session,
					userId: sessionDoc.userId,
					expires: session.expires,
				})
				)
				if (updatedSession.length) {
				return docToSession(updatedSession[0])
				} else {
				return null
				}
			}
			} catch {}
			return null
		},

		async deleteSession(sessionToken: string) {
			const surreal = await client
			try {
			const sessions = await surreal.query<[SessionDoc[]]>(
				`SELECT *
				FROM session
				WHERE sessionToken = $sessionToken
				LIMIT 1`,
				{ sessionToken }
			)
			const session = sessions[0]?.[0]
			if (session) {
				const sessionId = extractId(session.id)
				await surreal.delete(`session:${sessionId}`)
				return
			}
			} catch {}
		},

		// Modified
		async createVerificationToken({ identifier, expires, token }: VerificationToken) {
			const surreal = await client;

			const doc = {
				identifier,
				token,
				expires: expires.toISOString(), // always store as ISO string
			};

			const result = await surreal.create("verification_token", doc);

			// Pick first result
			const vt = Array.isArray(result) ? result[0] : result;

			if (!vt) return null;

			// Cast to what Auth.js expects
			return {
				identifier: vt.identifier as string,
				token: vt.token as string,
				expires: new Date(vt.expires as string),
			} satisfies VerificationToken;
		},


		async useVerificationToken({
			identifier,
			token,
		}: {
			identifier: string
			token: string
		}) {
			const surreal = await client
			try {
			const tokens = await surreal.query<
				[{ identifier: string; expires: string; token: string; id: string }[]]
			>(
				`SELECT *
				FROM verification_token
				WHERE identifier = $identifier
					AND token = $verificationToken
				LIMIT 1`,
				{ identifier, verificationToken: token }
			)
			if (tokens.length && tokens[0]) {
				const vt = tokens[0][0]
				if (vt) {
				await surreal.delete(vt.id)
				return {
					identifier: vt.identifier,
					expires: new Date(vt.expires),
					token: vt.token,
				}
				}
			} else {
				return null
			}
			} catch {}
			return null
		},
	}
}
