"use server";

import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";
import { validateEnvVar } from '@/lib/utils/env';

export async function createSessionClient() {
    const APPWRITE_URL = validateEnvVar('NEXT_PUBLIC_APPWRITE_URL', process.env.NEXT_PUBLIC_APPWRITE_URL);
    const APPWRITE_PROJECT_ID = validateEnvVar('NEXT_PUBLIC_APPWRITE_PROJECT_ID', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    
    const client = new Client()
        .setEndpoint(APPWRITE_URL)
        .setProject(APPWRITE_PROJECT_ID);

    const session = cookies().get("appwrite-session");

    if (!session || !session.value) {
        throw new Error("No session");
    }

    client.setSession(session.value);

    return {
        get account() {
            return new Account(client);
        },
        get databases() {
            return new Databases(client);
        },
    };
}

export async function createAdminClient() {
    const APPWRITE_URL = validateEnvVar('NEXT_PUBLIC_APPWRITE_URL', process.env.NEXT_PUBLIC_APPWRITE_URL);
    const APPWRITE_PROJECT_ID = validateEnvVar('NEXT_PUBLIC_APPWRITE_PROJECT_ID', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    const APPWRITE_API_KEY = validateEnvVar('APPWRITE_API_KEY', process.env.APPWRITE_API_KEY);
    
    const client = new Client()
        .setEndpoint(APPWRITE_URL)
        .setProject(APPWRITE_PROJECT_ID)
        .setKey(APPWRITE_API_KEY);

    return {
        get account() {
            return new Account(client);
        },
        get database() {
            return new Databases(client);
        },
        get user() {
            return new Users(client);
        }
    };
}

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        return await account.get();
    } catch (error) {
        return null;
    }
}
