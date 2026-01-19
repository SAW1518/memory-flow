"use server";
import postgres from "postgres";
import { GeneralWord } from "./types";
const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function getWords() {
  try {
    const result = await sql<GeneralWord[]>`SELECT * FROM general_words`;
    return result;
  } catch (error) {
    console.error("Error fetching words:", error);
    return [];
  }
}
